import { searchBenefits, type SearchHit } from "@/lib/knowledge/search";
import { isTranslatedUiLang, type LanguageCode, type TranslatedUiLang } from "@/lib/languages";
import {
  daysUntil,
  type LetterAnalysis,
  type LetterExplanation,
  type LetterExtraction,
  type LetterResult,
} from "@/lib/letters";

type NoticeType = LetterExtraction["noticeType"];
type Program = LetterExtraction["program"];

const BENEFIT_HINT =
  /\b(medi[-\s]?cal|medicaid|calfresh|snap|food\s*stamps?|wic|cal\s*eitc|notice\s+of\s+action|benefits?\s+cal|dhcs|human\s+services|social\s+services|departamento|departamento\s+de\s+servicios)\b/i;

const PROGRAM_RULES: { re: RegExp; program: Program }[] = [
  { re: /\bmedi[-\s]?cal\b|\bmedicaid\b/i, program: "medi-cal" },
  { re: /\bcalfresh\b|\bsnap\b|\bfood\s*stamps?\b/i, program: "calfresh" },
  { re: /\bwic\b/i, program: "wic" },
  { re: /\bcal\s*eitc\b|\bearned\s+income\b/i, program: "caleitc" },
  { re: /\bfema\b|\bdisaster\b/i, program: "disaster" },
];

const NOTICE_RULES: { re: RegExp; notice: NoticeType }[] = [
  { re: /\brenew(al|ing)?\b|\bre[- ]?determination\b|\byellow\s+packet\b/i, notice: "renewal" },
  { re: /\brequest\s+for\s+information\b|\bproof\s+of\b|\bverification\b|\bdocuments?\s+needed\b|\binformation\s+needed\b/i, notice: "request-for-information" },
  { re: /\bapprov(ed|al)\b|\beligible\b/i, notice: "approval" },
  { re: /\bdeni(ed|al)\b|\bnot\s+eligible\b/i, notice: "denial" },
  { re: /\bdiscontinu(e|ance|ed)\b|\bterminat(e|ion|ed)\b|\bcancel(led|lation)?\b/i, notice: "discontinuance" },
  { re: /\bchange\s+in\s+benefits?\b|\bbenefit\s+amount\b/i, notice: "change-in-benefits" },
  { re: /\bappointment\b|\bscheduled\b/i, notice: "appointment" },
  { re: /\boverpayment\b|\bowe\b|\brepay\b/i, notice: "overpayment" },
  { re: /\bnotice\s+of\s+action\b/i, notice: "other" },
];

/** Pull likely YYYY-MM-DD deadlines from OCR text (US + ISO formats). */
export function extractDeadlineIso(text: string, now = new Date()): string | null {
  const year = now.getFullYear();
  const candidates: string[] = [];

  for (const m of text.matchAll(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/g)) {
    candidates.push(normalizeYmd(+m[1]!, +m[2]!, +m[3]!));
  }
  for (const m of text.matchAll(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/g)) {
    let y = +m[3]!;
    if (y < 100) y += 2000;
    candidates.push(normalizeYmd(y, +m[1]!, +m[2]!));
  }
  for (const m of text.matchAll(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\b/gi,
  )) {
    const month = MONTHS[m[1]!.toLowerCase()];
    if (month) candidates.push(normalizeYmd(+m[3]!, month, +m[2]!));
  }

  const valid = candidates.filter((iso) => {
    const d = daysUntil(iso, now);
    const y = Number(iso.slice(0, 4));
    return d !== null && d >= -30 && d <= 400 && y >= year - 1 && y <= year + 2;
  });
  // Prefer soonest future / recent deadline.
  valid.sort((a, b) => (daysUntil(a, now) ?? 999) - (daysUntil(b, now) ?? 999));
  return valid[0] ?? candidates.find((iso) => daysUntil(iso, now) !== null) ?? null;
}

const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function normalizeYmd(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function extractFormNumber(text: string): string | null {
  const m = text.match(/\b((?:MC|CF|CW|SAWS|TEMP|DHCS)[-\s]?\d{2,4}[A-Z]?)\b/i);
  return m ? m[1]!.replace(/\s+/g, " ").toUpperCase() : null;
}

export function extractPhone(text: string): string | null {
  const m = text.match(/(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b/);
  return m ? m[0]!.replace(/\s+/g, " ") : null;
}

function detectProgram(text: string): Program {
  for (const rule of PROGRAM_RULES) {
    if (rule.re.test(text)) return rule.program;
  }
  return BENEFIT_HINT.test(text) ? "other" : "unknown";
}

function detectNotice(text: string): NoticeType {
  for (const rule of NOTICE_RULES) {
    if (rule.re.test(text)) return rule.notice;
  }
  return "other";
}

function detectAgency(text: string): string | null {
  const county = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+County\b/);
  if (county) return `${county[1]} County`;
  if (/dhcs|department of health care services/i.test(text)) return "DHCS";
  if (/human services|social services|benefits\s*cal/i.test(text)) return "County social services";
  return null;
}

/** Heuristic extraction from OCR text — used when AI Gateway vision is unavailable. */
export function extractLetterFromText(text: string, now = new Date()): LetterExtraction | { ok: false; reason: "unreadable" | "not-a-letter" } {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length < 40) return { ok: false, reason: "unreadable" };
  if (!BENEFIT_HINT.test(cleaned) && !extractFormNumber(cleaned)) {
    return { ok: false, reason: "not-a-letter" };
  }

  const program = detectProgram(cleaned);
  const noticeType = detectNotice(cleaned);
  const deadline = extractDeadlineIso(cleaned, now);
  const formNumber = extractFormNumber(cleaned);
  const contactPhone = extractPhone(cleaned);
  const agency = detectAgency(cleaned);
  const hearing = /\bstate\s+hearing\b|\bappeal\b|\b90\s+days\b/i.test(cleaned);
  const docs: string[] = [];
  if (/\bincome\b/i.test(cleaned)) docs.push("proof of income");
  if (/\bresiden(ce|t)|address\b/i.test(cleaned)) docs.push("proof of address");
  if (/\bid\b|identification|driver.?s?\s+license/i.test(cleaned)) docs.push("photo ID");

  const action =
    noticeType === "renewal"
      ? "Complete and return the renewal form before the deadline."
      : noticeType === "request-for-information"
        ? "Send the requested documents before the deadline."
        : noticeType === "denial" || noticeType === "discontinuance"
          ? "Read the reason and ask for a State Hearing within 90 days if you disagree."
          : noticeType === "appointment"
            ? "Go to the appointment or call to reschedule."
            : "Read the letter carefully and follow any instructions before the deadline.";

  return {
    isBenefitsLetter: true,
    readable: true,
    agency,
    program,
    noticeType,
    formNumber,
    deadline,
    deadlineMeaning: deadline ? "date printed on the letter" : null,
    requestedAction: action,
    documentsRequested: docs,
    contactPhone,
    hearingRightsMentioned: hearing,
    keyFacts: [
      program !== "unknown" ? `Program looks like ${program}` : null,
      formNumber ? `Form ${formNumber}` : null,
      deadline ? `Date on letter: ${deadline}` : null,
    ].filter(Boolean) as string[],
  };
}

type Template = {
  whatThisMeans: string;
  whatToDo: string[];
  needHelp: string;
  uncertainty: string;
};

const TEMPLATES: Record<TranslatedUiLang, Record<NoticeType | "fallback", Template>> = {
  en: {
    renewal: {
      whatThisMeans: "This looks like a benefits renewal. You need to update your information so your coverage can continue.",
      whatToDo: [
        "Fill out the renewal form completely.",
        "Attach any proof the letter asks for.",
        "Return it before the deadline on the letter.",
      ],
      needHelp: "If you need help filling it out, ask a local helper or call the phone number on the letter.",
      uncertainty: "Costa read this photo on your phone without the cloud AI. Double-check dates and form numbers on the paper.",
    },
    "request-for-information": {
      whatThisMeans: "The county needs more information or proof from you.",
      whatToDo: [
        "Gather the documents listed on the letter.",
        "Send or upload them before the deadline.",
        "Keep copies of everything you send.",
      ],
      needHelp: "Call the phone number on the letter if you cannot find a document.",
      uncertainty: "Costa read this photo on your phone without the cloud AI. Confirm the exact documents on the paper.",
    },
    approval: {
      whatThisMeans: "This may be an approval notice for your benefits.",
      whatToDo: ["Read what was approved and when it starts.", "Save this letter with your records."],
      needHelp: "Call the number on the letter if something looks wrong.",
      uncertainty: "Costa read this photo on your phone without the cloud AI. Confirm the decision on the paper.",
    },
    denial: {
      whatThisMeans: "This may say your application or benefits were denied.",
      whatToDo: [
        "Read the reason carefully.",
        "If you disagree, ask for a State Hearing within 90 days: (800) 743-8525.",
        "You can also ask a local helper to review it with you.",
      ],
      needHelp: "A local helper can help you understand the denial and the hearing process.",
      uncertainty: "Costa read this photo on your phone without the cloud AI. Confirm the decision and deadlines on the paper.",
    },
    discontinuance: {
      whatThisMeans: "This may say your benefits will stop or have stopped.",
      whatToDo: [
        "Check the stop date on the letter.",
        "If you disagree, ask for a State Hearing within 90 days: (800) 743-8525.",
        "Ask a helper if you can reapply or fix the issue.",
      ],
      needHelp: "Call the number on the letter or ask a local helper right away.",
      uncertainty: "Costa read this photo on your phone without the cloud AI. Confirm the stop date on the paper.",
    },
    "change-in-benefits": {
      whatThisMeans: "This may describe a change in your benefit amount or coverage.",
      whatToDo: ["Read what is changing and when.", "Call the number on the letter if you have questions."],
      needHelp: "A local helper can review the change with you.",
      uncertainty: "Costa read this photo on your phone without the cloud AI. Confirm the new amounts on the paper.",
    },
    appointment: {
      whatThisMeans: "This looks like an appointment notice.",
      whatToDo: ["Write down the date, time, and place.", "Call ahead if you need to reschedule."],
      needHelp: "Use the phone number on the letter to change the appointment.",
      uncertainty: "Costa read this photo on your phone without the cloud AI. Confirm the appointment details on the paper.",
    },
    overpayment: {
      whatThisMeans: "This may say the county thinks you were overpaid.",
      whatToDo: ["Read how much and why.", "Ask about repayment options or a hearing if you disagree."],
      needHelp: "Call the number on the letter before you ignore it.",
      uncertainty: "Costa read this photo on your phone without the cloud AI. Confirm the amount on the paper.",
    },
    other: {
      whatThisMeans: "This looks like a benefits letter. Costa found some details but could not classify the exact notice type.",
      whatToDo: [
        "Find any deadline and do what the letter asks before that date.",
        "Call the phone number printed on the letter if you are unsure.",
      ],
      needHelp: "Ask a local helper to read it with you.",
      uncertainty: "Costa read this photo on your phone without the cloud AI. Please verify every detail on the paper.",
    },
    fallback: {
      whatThisMeans: "Costa found text that may be from a benefits letter.",
      whatToDo: ["Look for a deadline and any forms to return.", "Call the number on the letter if you need help."],
      needHelp: "A local helper can review the letter with you.",
      uncertainty: "Costa read this photo on your phone without the cloud AI. Please verify every detail on the paper.",
    },
  },
  es: {
    renewal: {
      whatThisMeans: "Parece una renovación de beneficios. Debe actualizar su información para que continúe su cobertura.",
      whatToDo: ["Complete el formulario de renovación.", "Adjunte las pruebas que pide la carta.", "Devuélvalo antes de la fecha límite."],
      needHelp: "Si necesita ayuda, llame al número de la carta o pida ayuda local.",
      uncertainty: "Costa leyó esta foto en su teléfono sin la IA en la nube. Verifique fechas y números de formulario en el papel.",
    },
    "request-for-information": {
      whatThisMeans: "El condado necesita más información o pruebas de usted.",
      whatToDo: ["Reúna los documentos que pide la carta.", "Envíelos antes de la fecha límite.", "Guarde copias de todo."],
      needHelp: "Llame al número de la carta si no encuentra un documento.",
      uncertainty: "Costa leyó esta foto en su teléfono sin la IA en la nube. Confirme los documentos en el papel.",
    },
    approval: {
      whatThisMeans: "Puede ser un aviso de aprobación de sus beneficios.",
      whatToDo: ["Lea qué se aprobó y cuándo empieza.", "Guarde esta carta."],
      needHelp: "Llame al número de la carta si algo se ve mal.",
      uncertainty: "Costa leyó esta foto en su teléfono sin la IA en la nube. Confirme la decisión en el papel.",
    },
    denial: {
      whatThisMeans: "Puede decir que su solicitud o beneficios fueron negados.",
      whatToDo: ["Lea el motivo con cuidado.", "Si no está de acuerdo, pida una Audiencia Estatal en 90 días: (800) 743-8525.", "También puede pedir ayuda local."],
      needHelp: "Una persona local puede ayudarle con la denegación y la audiencia.",
      uncertainty: "Costa leyó esta foto en su teléfono sin la IA en la nube. Confirme la decisión y las fechas en el papel.",
    },
    discontinuance: {
      whatThisMeans: "Puede decir que sus beneficios se detendrán o se detuvieron.",
      whatToDo: ["Revise la fecha de corte.", "Si no está de acuerdo, pida una Audiencia Estatal en 90 días: (800) 743-8525.", "Pregunte si puede volver a solicitar o corregir el problema."],
      needHelp: "Llame al número de la carta o pida ayuda local de inmediato.",
      uncertainty: "Costa leyó esta foto en su teléfono sin la IA en la nube. Confirme la fecha en el papel.",
    },
    "change-in-benefits": {
      whatThisMeans: "Puede describir un cambio en su beneficio o cobertura.",
      whatToDo: ["Lea qué cambia y cuándo.", "Llame al número de la carta si tiene preguntas."],
      needHelp: "Una persona local puede revisar el cambio con usted.",
      uncertainty: "Costa leyó esta foto en su teléfono sin la IA en la nube. Confirme los montos en el papel.",
    },
    appointment: {
      whatThisMeans: "Parece un aviso de cita.",
      whatToDo: ["Anote la fecha, hora y lugar.", "Llame si necesita cambiar la cita."],
      needHelp: "Use el teléfono de la carta para reprogramar.",
      uncertainty: "Costa leyó esta foto en su teléfono sin la IA en la nube. Confirme los detalles en el papel.",
    },
    overpayment: {
      whatThisMeans: "Puede decir que el condado cree que le pagaron de más.",
      whatToDo: ["Lea cuánto y por qué.", "Pregunte sobre opciones de pago o una audiencia si no está de acuerdo."],
      needHelp: "Llame al número de la carta antes de ignorarla.",
      uncertainty: "Costa leyó esta foto en su teléfono sin la IA en la nube. Confirme el monto en el papel.",
    },
    other: {
      whatThisMeans: "Parece una carta de beneficios. Costa encontró algunos detalles pero no pudo clasificar el tipo exacto.",
      whatToDo: ["Busque una fecha límite y haga lo que pide la carta.", "Llame al teléfono impreso si no está seguro."],
      needHelp: "Pida que una persona local la lea con usted.",
      uncertainty: "Costa leyó esta foto en su teléfono sin la IA en la nube. Verifique cada detalle en el papel.",
    },
    fallback: {
      whatThisMeans: "Costa encontró texto que puede ser de una carta de beneficios.",
      whatToDo: ["Busque una fecha límite y formularios que deba devolver.", "Llame al número de la carta si necesita ayuda."],
      needHelp: "Una persona local puede revisar la carta con usted.",
      uncertainty: "Costa leyó esta foto en su teléfono sin la IA en la nube. Verifique cada detalle en el papel.",
    },
  },
  zh: {
    renewal: {
      whatThisMeans: "这看起来像福利续保通知。您需要更新信息，以便继续享有保障。",
      whatToDo: ["完整填写续保表格。", "按信中要求附上证明材料。", "在截止日期前寄回。"],
      needHelp: "如需帮助，请拨打信上的电话或联系本地协助人员。",
      uncertainty: "Costa 在您的手机上离线读取了这张照片。请在纸质信件上核对日期和表号。",
    },
    "request-for-information": {
      whatThisMeans: "县政府需要您提供更多信息或证明。",
      whatToDo: ["准备信中列出的材料。", "在截止日期前提交。", "保留所有副本。"],
      needHelp: "找不到材料时，请拨打信上的电话。",
      uncertainty: "Costa 在您的手机上离线读取了这张照片。请核对纸质信件上的材料清单。",
    },
    approval: {
      whatThisMeans: "这可能是批准通知。",
      whatToDo: ["确认批准内容和生效日期。", "妥善保存此信。"],
      needHelp: "如有疑问，请拨打信上的电话。",
      uncertainty: "Costa 在您的手机上离线读取了这张照片。请核对纸质信件上的决定。",
    },
    denial: {
      whatThisMeans: "这可能表示申请或福利被拒绝。",
      whatToDo: ["仔细阅读原因。", "如不同意，可在 90 天内申请州听证会：(800) 743-8525。", "也可请本地协助人员一起查看。"],
      needHelp: "本地协助人员可帮您理解拒绝原因和听证流程。",
      uncertainty: "Costa 在您的手机上离线读取了这张照片。请核对纸质信件上的决定和期限。",
    },
    discontinuance: {
      whatThisMeans: "这可能表示福利将停止或已停止。",
      whatToDo: ["查看停止日期。", "如不同意，可在 90 天内申请州听证会：(800) 743-8525。", "询问是否可重新申请或纠正问题。"],
      needHelp: "请立即拨打信上的电话或联系本地协助人员。",
      uncertainty: "Costa 在您的手机上离线读取了这张照片。请核对纸质信件上的日期。",
    },
    "change-in-benefits": {
      whatThisMeans: "这可能说明福利金额或保障有变化。",
      whatToDo: ["阅读具体变化及生效时间。", "有疑问请拨打信上的电话。"],
      needHelp: "本地协助人员可与您一起查看变更。",
      uncertainty: "Costa 在您的手机上离线读取了这张照片。请核对纸质信件上的金额。",
    },
    appointment: {
      whatThisMeans: "这看起来像预约通知。",
      whatToDo: ["记下日期、时间和地点。", "如需改期请提前致电。"],
      needHelp: "使用信上的电话改约。",
      uncertainty: "Costa 在您的手机上离线读取了这张照片。请核对纸质信件上的预约信息。",
    },
    overpayment: {
      whatThisMeans: "这可能表示县政府认为多付了您款项。",
      whatToDo: ["阅读金额和原因。", "如不同意，可询问还款方式或申请听证。"],
      needHelp: "请先拨打信上的电话，不要忽略。",
      uncertainty: "Costa 在您的手机上离线读取了这张照片。请核对纸质信件上的金额。",
    },
    other: {
      whatThisMeans: "这看起来像福利信件。Costa 找到了一些信息，但无法确定具体通知类型。",
      whatToDo: ["找到截止日期并按要求办理。", "不确定时拨打信上印刷的电话。"],
      needHelp: "请本地协助人员与您一起阅读。",
      uncertainty: "Costa 在您的手机上离线读取了这张照片。请仔细核对纸质信件上的每一项。",
    },
    fallback: {
      whatThisMeans: "Costa 在照片中发现了可能与福利相关的文字。",
      whatToDo: ["查找截止日期和需要寄回的表格。", "需要帮助时拨打信上的电话。"],
      needHelp: "本地协助人员可与您一起查看此信。",
      uncertainty: "Costa 在您的手机上离线读取了这张照片。请仔细核对纸质信件上的每一项。",
    },
  },
  tl: {
    renewal: {
      whatThisMeans: "Mukhang renewal ng benepisyo ito. Kailangan mong i-update ang impormasyon para magpatuloy ang coverage.",
      whatToDo: ["Kumpletuhin ang renewal form.", "Ikabit ang mga proof na hinihingi ng sulat.", "Ibalik bago ang deadline."],
      needHelp: "Kung kailangan mo ng tulong, tawagan ang numero sa sulat o humingi ng local helper.",
      uncertainty: "Binasa ni Costa ang litrato sa telepono mo nang walang cloud AI. I-double-check ang petsa at form number sa papel.",
    },
    "request-for-information": {
      whatThisMeans: "Kailangan ng county ng higit pang impormasyon o proof mula sa iyo.",
      whatToDo: ["Tipunin ang mga dokumentong nakalista.", "Ipadala bago ang deadline.", "Mag-keep ng kopya."],
      needHelp: "Tawagan ang numero sa sulat kung wala kang dokumento.",
      uncertainty: "Binasa ni Costa ang litrato sa telepono mo nang walang cloud AI. Beripikahin ang listahan sa papel.",
    },
    approval: {
      whatThisMeans: "Maaaring approval notice ito para sa benepisyo mo.",
      whatToDo: ["Basahin kung ano ang na-approve at kailan magsisimula.", "I-save ang sulat."],
      needHelp: "Tawagan ang numero sa sulat kung may mali.",
      uncertainty: "Binasa ni Costa ang litrato sa telepono mo nang walang cloud AI. Beripikahin ang desisyon sa papel.",
    },
    denial: {
      whatThisMeans: "Maaaring nagsasabi itong na-deny ang application o benepisyo mo.",
      whatToDo: ["Basahing mabuti ang dahilan.", "Kung hindi ka sang-ayon, mag-request ng State Hearing sa loob ng 90 araw: (800) 743-8525.", "Puwede ring humingi ng local helper."],
      needHelp: "Matutulungan ka ng local helper sa denial at hearing.",
      uncertainty: "Binasa ni Costa ang litrato sa telepono mo nang walang cloud AI. Beripikahin ang desisyon at deadline sa papel.",
    },
    discontinuance: {
      whatThisMeans: "Maaaring nagsasabi itong titigil o huminto na ang benepisyo mo.",
      whatToDo: ["Tingnan ang stop date.", "Kung hindi ka sang-ayon, mag-request ng State Hearing sa loob ng 90 araw: (800) 743-8525.", "Itanong kung puwedeng mag-reapply o ayusin ang isyu."],
      needHelp: "Agad na tawagan ang numero sa sulat o humingi ng local helper.",
      uncertainty: "Binasa ni Costa ang litrato sa telepono mo nang walang cloud AI. Beripikahin ang petsa sa papel.",
    },
    "change-in-benefits": {
      whatThisMeans: "Maaaring may pagbabago sa benepisyo o coverage mo.",
      whatToDo: ["Basahin kung ano ang nagbabago at kailan.", "Tawagan ang numero sa sulat kung may tanong."],
      needHelp: "Matutulungan ka ng local helper suriin ang pagbabago.",
      uncertainty: "Binasa ni Costa ang litrato sa telepono mo nang walang cloud AI. Beripikahin ang amount sa papel.",
    },
    appointment: {
      whatThisMeans: "Mukhang appointment notice ito.",
      whatToDo: ["Isulat ang petsa, oras, at lugar.", "Tumawag kung kailangang i-reschedule."],
      needHelp: "Gamitin ang numero sa sulat para magpalit ng appointment.",
      uncertainty: "Binasa ni Costa ang litrato sa telepono mo nang walang cloud AI. Beripikahin ang detalye sa papel.",
    },
    overpayment: {
      whatThisMeans: "Maaaring sinasabi ng county na sobra ang binayad sa iyo.",
      whatToDo: ["Basahin ang amount at dahilan.", "Itanong ang repayment options o hearing kung hindi ka sang-ayon."],
      needHelp: "Tawagan ang numero sa sulat bago balewalain.",
      uncertainty: "Binasa ni Costa ang litrato sa telepono mo nang walang cloud AI. Beripikahin ang amount sa papel.",
    },
    other: {
      whatThisMeans: "Mukhang sulat tungkol sa benepisyo. May nakitang detalye si Costa pero hindi tiyak ang uri.",
      whatToDo: ["Hanapin ang deadline at gawin ang hinihingi ng sulat.", "Tawagan ang numerong nakalimbag kung hindi ka sigurado."],
      needHelp: "Humingi ng local helper para basahin kasama ka.",
      uncertainty: "Binasa ni Costa ang litrato sa telepono mo nang walang cloud AI. Beripikahin ang bawat detalye sa papel.",
    },
    fallback: {
      whatThisMeans: "May tekstong posibleng mula sa sulat tungkol sa benepisyo.",
      whatToDo: ["Hanapin ang deadline at mga form na ibabalik.", "Tawagan ang numero sa sulat kung kailangan ng tulong."],
      needHelp: "Matutulungan ka ng local helper suriin ang sulat.",
      uncertainty: "Binasa ni Costa ang litrato sa telepono mo nang walang cloud AI. Beripikahin ang bawat detalye sa papel.",
    },
  },
  vi: {
    renewal: {
      whatThisMeans: "Đây có vẻ là thư gia hạn phúc lợi. Bạn cần cập nhật thông tin để tiếp tục được bảo hiểm.",
      whatToDo: ["Điền đầy đủ mẫu gia hạn.", "Đính kèm giấy tờ thư yêu cầu.", "Gửi lại trước hạn chót."],
      needHelp: "Nếu cần trợ giúp, hãy gọi số trên thư hoặc nhờ người hỗ trợ địa phương.",
      uncertainty: "Costa đã đọc ảnh trên điện thoại của bạn mà không dùng AI đám mây. Hãy kiểm tra lại ngày và mã mẫu trên giấy.",
    },
    "request-for-information": {
      whatThisMeans: "Quận cần thêm thông tin hoặc giấy tờ từ bạn.",
      whatToDo: ["Chuẩn bị các giấy tờ được liệt kê.", "Gửi trước hạn chót.", "Giữ bản sao."],
      needHelp: "Gọi số trên thư nếu bạn thiếu giấy tờ.",
      uncertainty: "Costa đã đọc ảnh trên điện thoại của bạn mà không dùng AI đám mây. Hãy xác nhận danh sách trên giấy.",
    },
    approval: {
      whatThisMeans: "Đây có thể là thông báo phê duyệt phúc lợi.",
      whatToDo: ["Đọc nội dung được duyệt và ngày bắt đầu.", "Lưu thư này."],
      needHelp: "Gọi số trên thư nếu có gì sai.",
      uncertainty: "Costa đã đọc ảnh trên điện thoại của bạn mà không dùng AI đám mây. Hãy xác nhận quyết định trên giấy.",
    },
    denial: {
      whatThisMeans: "Đây có thể nói đơn hoặc phúc lợi của bạn bị từ chối.",
      whatToDo: ["Đọc kỹ lý do.", "Nếu không đồng ý, yêu cầu Phiên điều trần Tiểu bang trong 90 ngày: (800) 743-8525.", "Bạn cũng có thể nhờ người hỗ trợ địa phương."],
      needHelp: "Người hỗ trợ địa phương có thể giúp bạn hiểu việc từ chối và quy trình điều trần.",
      uncertainty: "Costa đã đọc ảnh trên điện thoại của bạn mà không dùng AI đám mây. Hãy xác nhận quyết định và hạn trên giấy.",
    },
    discontinuance: {
      whatThisMeans: "Đây có thể nói phúc lợi sẽ dừng hoặc đã dừng.",
      whatToDo: ["Kiểm tra ngày dừng.", "Nếu không đồng ý, yêu cầu Phiên điều trần Tiểu bang trong 90 ngày: (800) 743-8525.", "Hỏi xem có thể nộp lại đơn hoặc sửa vấn đề."],
      needHelp: "Hãy gọi số trên thư hoặc nhờ hỗ trợ địa phương ngay.",
      uncertainty: "Costa đã đọc ảnh trên điện thoại của bạn mà không dùng AI đám mây. Hãy xác nhận ngày trên giấy.",
    },
    "change-in-benefits": {
      whatThisMeans: "Đây có thể mô tả thay đổi mức phúc lợi hoặc bảo hiểm.",
      whatToDo: ["Đọc thay đổi và thời điểm.", "Gọi số trên thư nếu có câu hỏi."],
      needHelp: "Người hỗ trợ địa phương có thể xem lại thay đổi với bạn.",
      uncertainty: "Costa đã đọc ảnh trên điện thoại của bạn mà không dùng AI đám mây. Hãy xác nhận số tiền trên giấy.",
    },
    appointment: {
      whatThisMeans: "Đây có vẻ là thông báo cuộc hẹn.",
      whatToDo: ["Ghi lại ngày, giờ và địa điểm.", "Gọi trước nếu cần đổi lịch."],
      needHelp: "Dùng số trên thư để đổi cuộc hẹn.",
      uncertainty: "Costa đã đọc ảnh trên điện thoại của bạn mà không dùng AI đám mây. Hãy xác nhận chi tiết trên giấy.",
    },
    overpayment: {
      whatThisMeans: "Đây có thể nói quận cho rằng bạn được trả thừa.",
      whatToDo: ["Đọc số tiền và lý do.", "Hỏi về trả góp hoặc điều trần nếu không đồng ý."],
      needHelp: "Gọi số trên thư trước khi bỏ qua.",
      uncertainty: "Costa đã đọc ảnh trên điện thoại của bạn mà không dùng AI đám mây. Hãy xác nhận số tiền trên giấy.",
    },
    other: {
      whatThisMeans: "Đây có vẻ là thư phúc lợi. Costa tìm thấy một số chi tiết nhưng chưa phân loại được loại thông báo.",
      whatToDo: ["Tìm hạn chót và làm theo yêu cầu của thư.", "Gọi số in trên thư nếu chưa chắc."],
      needHelp: "Nhờ người hỗ trợ địa phương đọc cùng bạn.",
      uncertainty: "Costa đã đọc ảnh trên điện thoại của bạn mà không dùng AI đám mây. Hãy kiểm tra từng chi tiết trên giấy.",
    },
    fallback: {
      whatThisMeans: "Costa tìm thấy chữ có thể từ thư phúc lợi.",
      whatToDo: ["Tìm hạn chót và mẫu cần gửi lại.", "Gọi số trên thư nếu cần giúp."],
      needHelp: "Người hỗ trợ địa phương có thể xem lại thư với bạn.",
      uncertainty: "Costa đã đọc ảnh trên điện thoại của bạn mà không dùng AI đám mây. Hãy kiểm tra từng chi tiết trên giấy.",
    },
  },
};

function buildExplanation(extraction: LetterExtraction, language: LanguageCode, hit: SearchHit | undefined): LetterExplanation {
  const pack = isTranslatedUiLang(language) ? TEMPLATES[language] : TEMPLATES.en;
  const t = pack[extraction.noticeType] ?? pack.fallback;
  const deadline =
    extraction.deadline && extraction.deadlineMeaning
      ? `${extraction.deadline} (${extraction.deadlineMeaning})`
      : extraction.deadline;
  const whatToDo = [...t.whatToDo];
  if (hit?.nextAction && !whatToDo.includes(hit.nextAction)) {
    whatToDo.push(hit.nextAction);
  }
  return {
    whatThisMeans: t.whatThisMeans,
    whatToDo: whatToDo.slice(0, 4),
    deadline,
    needHelp: extraction.contactPhone ? `${t.needHelp} (${extraction.contactPhone})` : t.needHelp,
    uncertainty: t.uncertainty,
  };
}

/** Explain a letter from OCR text using heuristics + local knowledge search (no vision model). */
export async function analyzeLetterFromText(opts: {
  text: string;
  language: LanguageCode;
}): Promise<LetterResult> {
  const extracted = extractLetterFromText(opts.text);
  if ("reason" in extracted) return extracted;
  const extraction = extracted;

  const program = ["medi-cal", "calfresh", "wic", "caleitc", "disaster"].includes(extraction.program)
    ? (extraction.program as SearchHit["program"])
    : undefined;
  const query = [extraction.program, extraction.noticeType.replace(/-/g, " "), extraction.formNumber]
    .filter(Boolean)
    .join(" ");
  const search = await searchBenefits({ query: query || "benefits letter", program });
  const days = daysUntil(extraction.deadline);
  const explanation = buildExplanation(extraction, opts.language, search.results[0]);

  const seen = new Set<string>();
  const sources = search.results
    .filter((h) => !seen.has(h.sourceId) && seen.add(h.sourceId))
    .map((h) => ({
      sourceId: h.sourceId,
      title: h.title,
      agency: h.agency,
      url: h.url,
      lastVerified: h.lastVerified,
    }));

  const result: LetterAnalysis = {
    ok: true,
    language: opts.language,
    extraction,
    explanation,
    daysUntilDeadline: days,
    sources,
  };
  return result;
}
