import { searchBenefits, type SearchHit, type SearchResponse } from "@/lib/knowledge/search";
import { findLocalHelp } from "@/lib/local-help";
import { faqAnswer, faqQuestion, faqSources, matchFaq } from "@/lib/faq";
import type { LanguageCode } from "@/lib/languages";
import { wantsHuman } from "@/lib/safety/intent";
import type { ToolTrace } from "./index";

export interface LocalAgentInput {
  text: string;
  language: LanguageCode;
  wantsHumanHint?: boolean;
}

export interface LocalAgentResult {
  text: string;
  tools: ToolTrace[];
  kind: "faq" | "grounded" | "help" | "none" | "emergency";
  nearFaqQuestion?: string | null;
}

const SOFT_FAQ = 0.48;

const EMERGENCY =
  /\b(911|emergency|emergencia|응급|khẩn cấp|emergency room|chest pain|can'?t breathe|cannot breathe|no puede respirar|hindi makahinga|không thở)\b|急救|비상|喘不过|喘不过气|不能呼吸|không thở được/i;

function emergencyText(language: LanguageCode): string {
  const map: Record<LanguageCode, string> = {
    en: "If this is an emergency, call 911 right away. Costa is for benefits questions, not medical emergencies.",
    es: "Si es una emergencia, llame al 911 ahora mismo. Costa es para preguntas de beneficios, no emergencias médicas.",
    zh: "如果这是紧急情况，请立即拨打 911。Costa 只帮助福利问题，不能处理医疗紧急情况。",
    tl: "Kung emergency ito, tumawag agad sa 911. Para sa benefits ang Costa, hindi sa medical emergency.",
    vi: "Nếu đây là cấp cứu, hãy gọi 911 ngay. Costa chỉ giúp về phúc lợi, không phải cấp cứu y tế.",
    ko: "응급 상황이면 지금 바로 911에 전화하세요. Costa는 혜택 질문용이며 의료 응급이 아닙니다.",
    pt: "Se for uma emergência, ligue já para o 911. A Costa é para benefícios, não para emergências médicas.",
  };
  return map[language];
}

function formatHits(hits: SearchHit[], language: LanguageCode): string {
  const lines: string[] = [];
  for (const h of hits.slice(0, 3)) {
    const excerpt = h.excerpt.replace(/\s+/g, " ").trim().slice(0, 420);
    lines.push(`${excerpt}\n→ ${h.nextAction}\n(${h.agency}, verified ${h.lastVerified})`);
  }
  const closer =
    language === "es"
      ? "Solo la agencia decide elegibilidad. Si necesita una persona, abra Ayuda."
      : language === "zh"
        ? "只有官方机构可以决定是否合资格。如需人工帮助，请打开“帮助”。"
        : language === "ko"
          ? "자격은 기관만 결정합니다. 사람이 필요하면 Help를 열어 주세요."
          : language === "pt"
            ? "Só a agência decide elegibilidade. Se precisar de uma pessoa, abra Ajuda."
            : language === "vi"
              ? "Chỉ cơ quan mới quyết định đủ điều kiện. Nếu cần người thật, hãy mở Trợ giúp."
              : language === "tl"
                ? "Ang ahensya lang ang magdedesisyon ng eligibility. Kung kailangan mo ng tao, buksan ang Help."
                : "Only the agency decides eligibility. If you need a person, open Help.";
  return `${lines.join("\n\n")}\n\n${closer}`;
}

function noSourceText(language: LanguageCode): string {
  const map: Record<LanguageCode, string> = {
    en: "I don't have a verified source for that yet. Try a common question on this screen, or open Help to request a person. Costa never guesses benefit rules.",
    es: "Todavía no tengo una fuente verificada para eso. Pruebe una pregunta común en esta pantalla, o abra Ayuda para pedir una persona. Costa no inventa reglas.",
    zh: "我还没有关于这个问题的核实来源。请试试本页的常见问题，或打开“帮助”请求人工联系。Costa 不会猜测福利规则。",
    tl: "Wala pa akong verified source para diyan. Subukan ang common questions sa screen, o buksan ang Help para humingi ng tao. Hindi gumagawa ng hula ang Costa.",
    vi: "Tôi chưa có nguồn đã xác minh cho câu đó. Hãy thử câu hỏi thường gặp trên màn hình, hoặc mở Trợ giúp để nhờ người. Costa không đoán quy định.",
    ko: "아직 검증된 출처가 없습니다. 화면의 자주 묻는 질문을 쓰거나 Help에서 사람을 요청하세요. Costa는 규정을 추측하지 않습니다.",
    pt: "Ainda não tenho uma fonte verificada para isso. Experimente uma pergunta comum neste ecrã, ou abra Ajuda para pedir uma pessoa. A Costa não inventa regras.",
  };
  return map[language];
}

function helpOfferText(language: LanguageCode, providers: { name: string; phone?: string | null }[]): string {
  const top = providers
    .slice(0, 3)
    .map((p) => (p.phone ? `${p.name}: ${p.phone}` : p.name))
    .join("\n");
  const lead: Record<LanguageCode, string> = {
    en: "I can connect you with a local helper. Here are places that can help, or open Help to request a callback:",
    es: "Puedo conectarle con una persona local. Lugares que pueden ayudar, o abra Ayuda para pedir que le llamen:",
    zh: "我可以为您联系本地帮手。以下机构可以帮忙，或打开“帮助”请求回电：",
    tl: "Pwede kitang ikonekta sa local helper. Narito ang mga lugar, o buksan ang Help para humingi ng callback:",
    vi: "Tôi có thể kết nối bạn với người hỗ trợ gần đây. Các nơi có thể giúp, hoặc mở Trợ giúp để yêu cầu gọi lại:",
    ko: "지역 도우미와 연결할 수 있습니다. 도움받을 곳이며, 콜백은 Help에서 요청하세요:",
    pt: "Posso ligá-lo a um ajudante local. Lugares que podem ajudar, ou abra Ajuda para pedir retorno:",
  };
  return `${lead[language]}\n\n${top || "211 / Health Consumer Alliance 1-888-804-3536"}`;
}

/** Topics Costa covers — used to refuse out-of-scope queries without inventing numbers. */
const IN_SCOPE =
  /\b(medi[-\s]?cal|medicaid|calfresh|snap|ebt|wic|cal\s*eitc|eitc|disaster|fema|benefit|renew|coverage|福利|医保|혜택|alimentação|alimentação)\b/i;

/**
 * Deterministic Ask path: emergency → soft FAQ → lexical knowledge search → human-help offer.
 * No cloud LLM. Optional Ollama can wrap this later for freer phrasing.
 */
export async function runLocalAgent(input: LocalAgentInput): Promise<LocalAgentResult> {
  const text = input.text.trim();
  const language = input.language;
  const tools: ToolTrace[] = [];

  if (!text) {
    return { text: noSourceText(language), tools, kind: "none" };
  }

  if (EMERGENCY.test(text)) {
    return { text: emergencyText(language), tools, kind: "emergency" };
  }

  // Topics Costa does not cover — never invent dollar amounts (e.g. Section 8).
  if (/\bsection\s*8\b|housing\s+voucher|住房补助|sección\s*8|sección 8/i.test(text)) {
    const help = await findLocalHelp({ area: "unknown", language, program: "any", need: "general" });
    tools.push({ toolName: "findLocalHelp", input: { area: "unknown", language }, output: help });
    return {
      text: `${noSourceText(language)}\n\n${helpOfferText(language, help.results)}`,
      tools,
      kind: "none",
    };
  }

  const soft = matchFaq(text, { preferredLang: language, minScore: SOFT_FAQ });
  // Hard FAQ only when confident; soft near-misses must still look like benefits questions.
  if (soft && soft.score >= 0.62) {
    return {
      text: faqAnswer(soft.faq, language),
      tools: [
        {
          toolName: "searchBenefits",
          input: { query: faqQuestion(soft.faq, language) },
          output: { found: true, results: faqSources(soft.faq) },
        },
      ],
      kind: "faq",
    };
  }
  const softOk = soft && soft.score >= SOFT_FAQ && IN_SCOPE.test(text);

  if (input.wantsHumanHint || wantsHuman(text)) {
    const help = await findLocalHelp({ area: "unknown", language, program: "any" });
    tools.push({ toolName: "findLocalHelp", input: { area: "unknown", language, program: "any" }, output: help });
    return {
      text: helpOfferText(language, help.results),
      tools,
      kind: "help",
      nearFaqQuestion: soft ? faqQuestion(soft.faq, language) : null,
    };
  }

  // Out-of-scope: admit no source + offer help — do not invent limits.
  // Ignore weak FAQ near-misses for non-benefits questions (e.g. weather → letter FAQ).
  if (!IN_SCOPE.test(text)) {
    const help = await findLocalHelp({ area: "unknown", language, program: "any", need: "general" });
    tools.push({ toolName: "findLocalHelp", input: { area: "unknown", language }, output: help });
    return {
      text: `${noSourceText(language)}\n\n${helpOfferText(language, help.results)}`,
      tools,
      kind: "none",
    };
  }

  const search: SearchResponse = await searchBenefits({ query: text });
  tools.push({ toolName: "searchBenefits", input: { query: text }, output: search });

  if (search.found && search.results.length > 0) {
    const preface =
      soft && soft.score >= SOFT_FAQ && language === "en"
        ? `Closest common question: “${faqQuestion(soft.faq, language)}”\n\n`
        : "";
    return {
      text: `${preface}${formatHits(search.results, language)}`,
      tools,
      kind: "grounded",
      nearFaqQuestion: soft ? faqQuestion(soft.faq, language) : null,
    };
  }

  if (soft && soft.score >= SOFT_FAQ) {
    return {
      text: faqAnswer(soft.faq, language),
      tools: [
        {
          toolName: "searchBenefits",
          input: { query: faqQuestion(soft.faq, language) },
          output: { found: true, results: faqSources(soft.faq) },
        },
      ],
      kind: "faq",
      nearFaqQuestion: faqQuestion(soft.faq, language),
    };
  }

  return { text: noSourceText(language), tools, kind: "none" };
}
