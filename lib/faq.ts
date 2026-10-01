import { getSource } from "@/lib/knowledge";
import type { TopicId } from "@/lib/i18n-app";
import type { LanguageCode } from "@/lib/languages";

/**
 * Pre-written answers to the most common questions, served without calling the model.
 * Every fact and phone number must come from the listed sources in content/sources;
 * tests/faq.test.ts enforces sources, phone numbers, and the output safety audit.
 * Translations should be reviewed by native speakers before any wording change ships.
 */
export interface Faq {
  id: string;
  topic: TopicId;
  sourceIds: string[];
  /** Canonical questions. Missing languages fall back to English for display. */
  question: { en: string } & Partial<Record<LanguageCode, string>>;
  answer: { en: string } & Partial<Record<LanguageCode, string>>;
  /** Extra phrasings (any language) that should map to this FAQ. */
  aliases?: string[];
}

const CORE_FAQS: Faq[] = [
  {
    id: "renew-medi-cal",
    topic: "health",
    sourceIds: ["medi-cal-renewal", "medi-cal-apply"],
    question: {
      en: "How do I renew my Medi-Cal?",
      es: "¿Cómo renuevo mi Medi-Cal?",
      zh: "我怎么续保 Medi-Cal？",
      tl: "Paano ko ire-renew ang Medi-Cal ko?",
      vi: "Làm sao để gia hạn Medi-Cal?",
      ko: "Medi-Cal을 어떻게 갱신하나요?",
      pt: "Como renovo o meu Medi-Cal?",
    },
    aliases: ["renew medi-cal", "medi-cal renewal", "how to renew medical", "yellow envelope", "renovar medi-cal", "메디칼 갱신"],
    answer: {
      en: "Medi-Cal checks every year that you still qualify. First, the county tries to renew you automatically. If it can, you get a notice and don't need to do anything.\n\nIf you get a renewal form in a yellow envelope:\n1. Check the pre-filled information and fix anything that is wrong.\n2. Send the proof it asks for, like pay stubs.\n3. Sign it and return it by the due date: online at BenefitsCal.com, by mail, by phone, or in person.\n\nIf you don't return it, your Medi-Cal will end. County phone: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.",
      es: "Medi-Cal revisa cada año si todavía califica. Primero, el condado intenta renovarle automáticamente. Si puede, le llega un aviso y no tiene que hacer nada.\n\nSi le llega un formulario de renovación en un sobre amarillo:\n1. Revise la información que ya viene escrita y corrija lo que esté mal.\n2. Envíe las pruebas que pide, como talones de pago.\n3. Fírmelo y entréguelo antes de la fecha límite: en línea en BenefitsCal.com, por correo, por teléfono o en persona.\n\nSi no lo entrega, su Medi-Cal se termina. Teléfono del condado: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.",
      zh: "Medi-Cal 每年都会审核您是否仍然合资格。县政府会先尝试自动为您续保。如果可以，您会收到通知，不需要做任何事。\n\n如果您收到黄色信封里的续保表格：\n1. 检查表格上已填好的信息，改正错误的地方。\n2. 寄送表格要求的证明，例如工资单。\n3. 签名，并在截止日期前交回：可以在 BenefitsCal.com 网上提交、邮寄、打电话或亲自去办。\n\n如果不交回表格，您的 Medi-Cal 会被终止。县政府电话：San Mateo 1-800-223-8383，Santa Clara 1-877-962-3633。",
      tl: "Tinitingnan ng Medi-Cal bawat taon kung pasok ka pa. Una, susubukan ng county na i-renew ka nang awtomatiko. Kung kaya nila, makakatanggap ka ng notice at wala ka nang kailangang gawin.\n\nKung may dumating na renewal form sa dilaw na sobre:\n1. Tingnan ang impormasyong nakasulat na at itama ang mali.\n2. Ipadala ang patunay na hinihingi, tulad ng pay stub.\n3. Pirmahan at ibalik bago ang deadline: online sa BenefitsCal.com, sa koreo, sa telepono, o nang personal.\n\nKung hindi mo ito ibabalik, matitigil ang Medi-Cal mo. Telepono ng county: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.",
      vi: "Mỗi năm Medi-Cal kiểm tra xem bạn có còn đủ điều kiện không. Trước tiên, quận sẽ cố gắng tự động gia hạn cho bạn. Nếu được, bạn sẽ nhận thư báo và không cần làm gì cả.\n\nNếu bạn nhận được mẫu gia hạn trong phong bì màu vàng:\n1. Kiểm tra thông tin đã điền sẵn và sửa chỗ sai.\n2. Gửi giấy tờ chứng minh được yêu cầu, như cuống lương.\n3. Ký tên và gửi lại trước hạn chót: trên mạng tại BenefitsCal.com, qua bưu điện, qua điện thoại hoặc đến tận nơi.\n\nNếu không gửi lại, Medi-Cal của bạn sẽ bị chấm dứt. Điện thoại của quận: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.",
      ko: "Medi-Cal은 매년 자격이 유지되는지 확인합니다. 먼저 카운티가 자동 갱신을 시도합니다. 가능하면 안내문을 받고 별도로 할 일이 없습니다.\n\n노란색 봉투의 갱신 양식을 받으면:\n1. 미리 적힌 정보를 확인하고 틀린 곳을 고치세요.\n2. 급여명세 등 요청된 증빙을 보내세요.\n3. 서명 후 마감일까지 제출: BenefitsCal.com, 우편, 전화, 또는 직접 방문.\n\n제출하지 않으면 Medi-Cal이 종료됩니다. 카운티 전화: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.",
      pt: "O Medi-Cal verifica todos os anos se você ainda se qualifica. Primeiro, o condado tenta renovar automaticamente. Se conseguir, você recebe um aviso e não precisa fazer nada.\n\nSe receber um formulário de renovação em envelope amarelo:\n1. Confira as informações pré-preenchidas e corrija o que estiver errado.\n2. Envie as provas pedidas, como contracheques.\n3. Assine e devolva até o prazo: online em BenefitsCal.com, por correio, telefone ou pessoalmente.\n\nSe não devolver, o Medi-Cal termina. Telefone do condado: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.",
    },
  },
  {
    id: "medi-cal-ended",
    topic: "health",
    sourceIds: ["medi-cal-lost-coverage"],
    question: {
      en: "My Medi-Cal was cut off. What do I do?",
      es: "Me cortaron el Medi-Cal. ¿Qué hago?",
      zh: "我的 Medi-Cal 被停了，怎么办？",
      tl: "Natigil ang Medi-Cal ko. Ano ang gagawin ko?",
      vi: "Medi-Cal của tôi bị cắt. Tôi phải làm gì?",
      ko: "Medi-Cal이 끊겼습니다. 어떻게 하나요?",
      pt: "Cortaram o meu Medi-Cal. O que faço?",
    },
    aliases: ["medi-cal cut off", "lost medi-cal", "medi-cal stopped", "me cortaron", "메디칼 끊김"],
    answer: {
      en: "If your Medi-Cal ended because of missing paperwork, you have 90 days from the end date to fix it.\n1. Send your county the signed renewal form and ALL the missing documents.\n2. You don't need a new application.\n3. If the county finds you still qualify, your coverage goes back to the date it ended.\n\nAfter 90 days, you must apply again. If you disagree with the decision, you have 90 days from the date on the notice to ask for a State Hearing: (800) 743-8525. Free help with Medi-Cal problems: Health Consumer Alliance, 1-888-804-3536.",
      es: "Si su Medi-Cal terminó por papeles que faltaban, tiene 90 días desde la fecha en que terminó para arreglarlo.\n1. Envíe al condado el formulario de renovación firmado y TODOS los documentos que faltan.\n2. No necesita una solicitud nueva.\n3. Si el condado ve que todavía califica, su cobertura regresa hasta la fecha en que terminó.\n\nDespués de 90 días, tiene que solicitar otra vez. Si no está de acuerdo con la decisión, tiene 90 días desde la fecha del aviso para pedir una Audiencia Estatal: (800) 743-8525. Ayuda gratis con problemas de Medi-Cal: Health Consumer Alliance, 1-888-804-3536.",
      zh: "如果您的 Medi-Cal 是因为缺少文件而被终止，您从终止日期起有 90 天时间补救。\n1. 把签好名的续保表格和所有缺少的文件寄给县政府。\n2. 不需要重新申请。\n3. 如果县政府确认您仍然合资格，您的保险会恢复到终止的那一天，中间不会断保。\n\n超过 90 天，就必须重新申请。如果您不同意这个决定，可以在通知日期起 90 天内要求州听证会：(800) 743-8525。Medi-Cal 问题免费帮助：Health Consumer Alliance，1-888-804-3536。",
      tl: "Kung natigil ang Medi-Cal mo dahil may kulang na papeles, may 90 araw ka mula sa petsa ng pagtigil para ayusin ito.\n1. Ipadala sa county ang pinirmahang renewal form at LAHAT ng kulang na dokumento.\n2. Hindi mo kailangan ng bagong aplikasyon.\n3. Kung makita ng county na pasok ka pa, ibabalik ang coverage mo hanggang sa petsa na tumigil ito.\n\nPagkalipas ng 90 araw, kailangan mong mag-apply ulit. Kung hindi ka sang-ayon sa desisyon, may 90 araw ka mula sa petsa ng notice para humingi ng State Hearing: (800) 743-8525. Libreng tulong sa problema sa Medi-Cal: Health Consumer Alliance, 1-888-804-3536.",
      vi: "Nếu Medi-Cal của bạn bị chấm dứt vì thiếu giấy tờ, bạn có 90 ngày kể từ ngày chấm dứt để sửa lại.\n1. Gửi cho quận mẫu gia hạn đã ký và TẤT CẢ giấy tờ còn thiếu.\n2. Bạn không cần nộp đơn mới.\n3. Nếu quận xác định bạn vẫn còn đủ điều kiện, bảo hiểm sẽ được khôi phục từ ngày bị chấm dứt.\n\nSau 90 ngày, bạn phải nộp đơn lại. Nếu không đồng ý với quyết định, bạn có 90 ngày kể từ ngày ghi trên thư báo để xin Phiên Điều Trần Tiểu Bang: (800) 743-8525. Trợ giúp miễn phí về Medi-Cal: Health Consumer Alliance, 1-888-804-3536.",
      ko: "서류 미비로 Medi-Cal이 종료됐다면, 종료일부터 90일 안에 고칠 수 있습니다.\n1. 서명한 갱신 양식과 빠진 서류를 모두 카운티에 보내세요.\n2. 새 신청서는 필요 없습니다.\n3. 카운티가 여전히 자격이 있다고 보면, 종료일부터 보장이 다시 이어집니다.\n\n90일이 지나면 다시 신청해야 합니다. 결정에 동의하지 않으면 안내문 날짜부터 90일 안에 주 청문회를 신청하세요: (800) 743-8525. Medi-Cal 무료 도움: Health Consumer Alliance, 1-888-804-3536.",
      pt: "Se o Medi-Cal terminou por falta de documentos, tem 90 dias a partir da data de fim para corrigir.\n1. Envie ao condado o formulário de renovação assinado e TODOS os documentos em falta.\n2. Não precisa de um pedido novo.\n3. Se o condado ver que ainda se qualifica, a cobertura volta à data em que terminou.\n\nDepois de 90 dias, tem de pedir de novo. Se discordar da decisão, tem 90 dias a partir da data do aviso para pedir Audiência Estadual: (800) 743-8525. Ajuda gratuita com Medi-Cal: Health Consumer Alliance, 1-888-804-3536.",
    },
  },
  {
    id: "apply-medi-cal",
    topic: "health",
    sourceIds: ["medi-cal-apply"],
    question: {
      en: "How do I apply for Medi-Cal?",
      es: "¿Cómo solicito Medi-Cal?",
      zh: "我怎么申请 Medi-Cal？",
      tl: "Paano mag-apply sa Medi-Cal?",
      vi: "Làm sao để đăng ký Medi-Cal?",
      ko: "Medi-Cal은 어떻게 신청하나요?",
      pt: "Como peço o Medi-Cal?",
    },
    aliases: ["apply for medi-cal", "sign up medi-cal", "get medi-cal", "solicitar medi-cal", "메디칼 신청"],
    answer: {
      en: "You can apply for Medi-Cal at any time of year. There is no deadline.\n- Online: BenefitsCal.com\n- By phone: San Mateo County 1-800-223-8383, Santa Clara County 1-877-962-3633\n- In person at your county human services office\n\nChildren under 19 and pregnant people can get full Medi-Cal no matter their immigration status, if they meet the income rules. Only the county can decide who qualifies. If it needs more information, it will send you a letter.",
      es: "Puede solicitar Medi-Cal en cualquier momento del año. No hay fecha límite.\n- En línea: BenefitsCal.com\n- Por teléfono: condado de San Mateo 1-800-223-8383, condado de Santa Clara 1-877-962-3633\n- En persona en la oficina de servicios humanos de su condado\n\nLos niños menores de 19 años y las personas embarazadas pueden recibir Medi-Cal completo sin importar su estatus migratorio, si cumplen las reglas de ingresos. Solo el condado puede decidir quién califica. Si necesita más información, le enviará una carta.",
      zh: "一年中任何时候都可以申请 Medi-Cal，没有截止日期。\n- 网上申请：BenefitsCal.com\n- 电话申请：San Mateo 县 1-800-223-8383，Santa Clara 县 1-877-962-3633\n- 亲自去您所在县的公众服务办公室\n\n19 岁以下的儿童和怀孕的人，只要符合收入规定，不论移民身份都可以获得全面的 Medi-Cal。只有县政府可以决定谁合资格。如果需要更多资料，县政府会寄信给您。",
      tl: "Puwede kang mag-apply sa Medi-Cal kahit anong oras ng taon. Walang deadline.\n- Online: BenefitsCal.com\n- Sa telepono: San Mateo County 1-800-223-8383, Santa Clara County 1-877-962-3633\n- Nang personal sa human services office ng county mo\n\nAng mga batang wala pang 19 taong gulang at mga buntis ay puwedeng makakuha ng buong Medi-Cal anuman ang immigration status, kung pasok sila sa income rules. Ang county lang ang puwedeng magpasya kung sino ang pasok. Kung kailangan nila ng dagdag na impormasyon, padadalhan ka nila ng sulat.",
      vi: "Bạn có thể đăng ký Medi-Cal bất cứ lúc nào trong năm. Không có hạn chót.\n- Trên mạng: BenefitsCal.com\n- Qua điện thoại: Quận San Mateo 1-800-223-8383, Quận Santa Clara 1-877-962-3633\n- Đến tận nơi văn phòng dịch vụ xã hội của quận\n\nTrẻ em dưới 19 tuổi và người đang mang thai có thể nhận Medi-Cal đầy đủ bất kể tình trạng di trú, nếu đáp ứng quy định về thu nhập. Chỉ có quận mới quyết định ai đủ điều kiện. Nếu cần thêm thông tin, quận sẽ gửi thư cho bạn.",
      ko: "Medi-Cal은 연중 언제든 신청할 수 있으며 마감일이 없습니다.\n- 온라인: BenefitsCal.com\n- 전화: San Mateo County 1-800-223-8383, Santa Clara County 1-877-962-3633\n- 카운티 사회서비스 사무실 방문\n\n19세 미만 아동과 임산부는 소득 요건만 충족하면 이민 신분과 상관없이 전체 Medi-Cal을 받을 수 있습니다. 자격은 카운티만 결정합니다. 추가 정보가 필요하면 편지를 보냅니다.",
      pt: "Pode pedir Medi-Cal em qualquer altura do ano. Não há prazo.\n- Online: BenefitsCal.com\n- Por telefone: Condado de San Mateo 1-800-223-8383, Condado de Santa Clara 1-877-962-3633\n- Pessoalmente no escritório de serviços humanos do condado\n\nCrianças menores de 19 anos e pessoas grávidas podem ter Medi-Cal completo independentemente do status migratório, se cumprirem as regras de renda. Só o condado decide quem se qualifica. Se precisar de mais informação, enviará uma carta.",
    },
  },
  {
    id: "food-help",
    topic: "food",
    sourceIds: ["calfresh", "wic"],
    question: {
      en: "Can my family get food help?",
      es: "¿Mi familia puede recibir ayuda para comida?",
      zh: "我家可以申请食物补助吗？",
      tl: "Puwede bang makakuha ng tulong sa pagkain ang pamilya ko?",
      vi: "Gia đình tôi có thể nhận trợ giúp thực phẩm không?",
      ko: "우리 가족이 식비 지원을 받을 수 있나요?",
      pt: "A minha família pode receber ajuda para comida?",
    },
    aliases: ["food stamps", "calfresh apply", "snap california", "ayuda para comida", "식비 지원"],
    answer: {
      en: "CalFresh gives monthly money for food on an EBT card. You can use it at most grocery stores and farmers markets.\n- Apply online at BenefitsCal.com or call 1-877-847-3663.\n- The county will do an interview, usually by phone, and ask for proof of income.\n- The county decides who qualifies and how much each household gets.\n\nIf someone in your home is pregnant or you care for a child under 5, also ask about WIC: 1-800-852-5770. WIC does not require a Social Security number or proof of citizenship.",
      es: "CalFresh da dinero cada mes para comida en una tarjeta EBT. Se puede usar en la mayoría de los supermercados y mercados de agricultores.\n- Solicite en línea en BenefitsCal.com o llame al 1-877-847-3663.\n- El condado le hará una entrevista, casi siempre por teléfono, y le pedirá prueba de ingresos.\n- El condado decide si califica y cuánto recibe.\n\nSi alguien en su casa está embarazada o cuida a un niño menor de 5 años, pregunte también por WIC: 1-800-852-5770. WIC no pide número de Seguro Social ni prueba de ciudadanía.",
      zh: "CalFresh 每月把买食物的钱存入 EBT 卡。大多数超市和农夫市场都可以使用。\n- 在 BenefitsCal.com 网上申请，或拨打 1-877-847-3663。\n- 县政府会进行面谈（通常用电话），并要求收入证明。\n- 由县政府决定您是否合资格以及可以领多少。\n\n如果家里有人怀孕，或您照顾 5 岁以下的孩子，也可以问问 WIC：1-800-852-5770。WIC 不要求社会安全号码或公民身份证明。",
      tl: "Ang CalFresh ay nagbibigay ng buwanang pera para sa pagkain sa isang EBT card. Puwede itong gamitin sa karamihan ng grocery at farmers market.\n- Mag-apply online sa BenefitsCal.com o tumawag sa 1-877-847-3663.\n- Mag-iinterview ang county, kadalasan sa telepono, at hihingi ng patunay ng kita.\n- Ang county ang magpapasya kung pasok ka at kung magkano ang matatanggap mo.\n\nKung may buntis sa bahay o may inaalagaan kang batang wala pang 5 taon, magtanong din tungkol sa WIC: 1-800-852-5770. Hindi humihingi ang WIC ng Social Security number o patunay ng citizenship.",
      vi: "CalFresh cấp tiền mua thực phẩm hằng tháng vào thẻ EBT. Bạn có thể dùng thẻ ở hầu hết các cửa hàng tạp hóa và chợ nông sản.\n- Đăng ký trên mạng tại BenefitsCal.com hoặc gọi 1-877-847-3663.\n- Quận sẽ phỏng vấn, thường là qua điện thoại, và yêu cầu giấy tờ chứng minh thu nhập.\n- Quận quyết định bạn có đủ điều kiện không và nhận được bao nhiêu.\n\nNếu trong nhà có người đang mang thai hoặc bạn chăm sóc trẻ dưới 5 tuổi, hãy hỏi thêm về WIC: 1-800-852-5770. WIC không yêu cầu số An Sinh Xã Hội hay giấy tờ chứng minh quốc tịch.",
      ko: "CalFresh는 EBT 카드로 매달 식비를 줍니다. 대부분 식료품점과 파머스마켓에서 쓸 수 있습니다.\n- BenefitsCal.com에서 신청하거나 1-877-847-3663로 전화하세요.\n- 카운티가 보통 전화로 면접하고 소득 증빙을 요청합니다.\n- 자격과 금액은 카운티가 결정합니다.\n\n집에 임산부가 있거나 5세 미만 아동을 돌보면 WIC도 문의하세요: 1-800-852-5770. WIC는 사회보장번호나 시민권 증명을 요구하지 않습니다.",
      pt: "O CalFresh dá dinheiro mensal para comida num cartão EBT. Pode usar na maioria dos supermercados e feiras.\n- Peça online em BenefitsCal.com ou ligue 1-877-847-3663.\n- O condado fará uma entrevista, quase sempre por telefone, e pedirá prova de renda.\n- O condado decide quem se qualifica e quanto recebe.\n\nSe alguém em casa está grávida ou você cuida de criança menor de 5 anos, pergunte também sobre WIC: 1-800-852-5770. O WIC não pede número de Seguro Social nem prova de cidadania.",
    },
  },
  {
    id: "wic",
    topic: "food",
    sourceIds: ["wic"],
    question: {
      en: "I'm pregnant or have a baby. Can I get WIC?",
      es: "Estoy embarazada o tengo un bebé. ¿Puedo recibir WIC?",
      zh: "我怀孕了或有小宝宝，可以申请 WIC 吗？",
      tl: "Buntis ako o may baby. Puwede ba akong mag-WIC?",
      vi: "Tôi đang mang thai hoặc có con nhỏ. Tôi có thể nhận WIC không?",
      ko: "임신 중이거나 아기가 있습니다. WIC를 받을 수 있나요?",
      pt: "Estou grávida ou tenho um bebé. Posso receber WIC?",
    },
    aliases: ["wic for baby", "wic pregnant", "apply wic", "wic 신청"],
    answer: {
      en: "WIC gives healthy food, nutrition help, and breastfeeding support. It is for people who are pregnant, breastfeeding, or had a baby in the last 6 months, and for children under 5.\n- If you already get Medi-Cal, CalFresh, or CalWORKs, you automatically meet the WIC income rule.\n- WIC does not require a Social Security number or proof of citizenship.\n- Call California WIC at 1-800-852-5770 to make an appointment. Only WIC staff can officially confirm eligibility.",
      es: "WIC da comida saludable, ayuda con la nutrición y apoyo para amamantar. Es para personas embarazadas, que están amamantando o que tuvieron un bebé en los últimos 6 meses, y para niños menores de 5 años.\n- Si ya recibe Medi-Cal, CalFresh o CalWORKs, cumple automáticamente la regla de ingresos de WIC.\n- WIC no pide número de Seguro Social ni prueba de ciudadanía.\n- Llame a WIC de California al 1-800-852-5770 para hacer una cita. Solo el personal de WIC puede confirmar si califica.",
      zh: "WIC 提供健康食物、营养指导和母乳喂养支持。适用于怀孕、正在哺乳或过去 6 个月内生过孩子的人，以及 5 岁以下的儿童。\n- 如果您已经有 Medi-Cal、CalFresh 或 CalWORKs，就自动符合 WIC 的收入规定。\n- WIC 不要求社会安全号码或公民身份证明。\n- 请拨打加州 WIC 1-800-852-5770 预约。只有 WIC 工作人员可以确认您是否合资格。",
      tl: "Nagbibigay ang WIC ng masustansyang pagkain, tulong sa nutrisyon, at suporta sa pagpapasuso. Para ito sa mga buntis, nagpapasuso, o nanganak sa loob ng huling 6 na buwan, at sa mga batang wala pang 5 taon.\n- Kung may Medi-Cal, CalFresh, o CalWORKs ka na, awtomatiko kang pasok sa income rule ng WIC.\n- Hindi humihingi ang WIC ng Social Security number o patunay ng citizenship.\n- Tumawag sa California WIC sa 1-800-852-5770 para magpa-appointment. Ang WIC staff lang ang makakapagkumpirma kung pasok ka.",
      vi: "WIC cung cấp thực phẩm lành mạnh, hướng dẫn dinh dưỡng và hỗ trợ cho con bú. Chương trình dành cho người đang mang thai, đang cho con bú hoặc mới sinh con trong 6 tháng qua, và trẻ em dưới 5 tuổi.\n- Nếu bạn đã có Medi-Cal, CalFresh hoặc CalWORKs, bạn tự động đáp ứng quy định thu nhập của WIC.\n- WIC không yêu cầu số An Sinh Xã Hội hay giấy tờ chứng minh quốc tịch.\n- Gọi WIC California số 1-800-852-5770 để lấy hẹn. Chỉ nhân viên WIC mới xác nhận được bạn có đủ điều kiện hay không.",
      ko: "WIC는 건강한 식품, 영양 지원, 모유수유 지원을 제공합니다. 임신·수유 중이거나 최근 6개월 내 출산한 사람, 5세 미만 아동이 대상입니다.\n- 이미 Medi-Cal, CalFresh, CalWORKs를 받으면 WIC 소득 요건을 자동으로 충족합니다.\n- WIC는 사회보장번호나 시민권 증명을 요구하지 않습니다.\n- 캘리포니아 WIC 1-800-852-5770으로 예약하세요. 자격 확정은 WIC 직원만 할 수 있습니다.",
      pt: "O WIC dá comida saudável, ajuda de nutrição e apoio à amamentação. É para quem está grávida, amamentando ou teve bebé nos últimos 6 meses, e para crianças menores de 5 anos.\n- Se já tem Medi-Cal, CalFresh ou CalWORKs, cumpre automaticamente a regra de renda do WIC.\n- O WIC não pede número de Seguro Social nem prova de cidadania.\n- Ligue ao WIC da Califórnia 1-800-852-5770 para marcar. Só o pessoal do WIC confirma se se qualifica.",
    },
  },
  {
    id: "report-change",
    topic: "health",
    sourceIds: ["medi-cal-changes", "medi-cal-apply"],
    question: {
      en: "I moved or my income changed. What do I do?",
      es: "Me mudé o cambiaron mis ingresos. ¿Qué hago?",
      zh: "我搬家了或收入变了，该怎么办？",
      tl: "Lumipat ako o nagbago ang kita ko. Ano ang gagawin ko?",
      vi: "Tôi đã chuyển nhà hoặc thu nhập thay đổi. Tôi phải làm gì?",
      ko: "이사했거나 소득이 바뀌었습니다. 어떻게 하나요?",
      pt: "Mudei de casa ou a minha renda mudou. O que faço?",
    },
    aliases: ["report address change", "income changed medi-cal", "moved to new county", "주소 변경"],
    answer: {
      en: "Tell your county within 10 days when you move, change your mailing address, or your income or job changes.\n- Report online at BenefitsCal.com or call your county: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- If you move to another county in California, your Medi-Cal can move with you. You will choose a new health plan in the new county.\n\nThe county mails renewal forms to your address, so keeping it up to date helps you keep Medi-Cal.",
      es: "Avise a su condado dentro de 10 días si se muda, cambia su dirección de correo, o cambian sus ingresos o su trabajo.\n- Repórtelo en línea en BenefitsCal.com o llame a su condado: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- Si se muda a otro condado de California, su Medi-Cal se puede mudar con usted. Va a elegir un plan de salud nuevo en el nuevo condado.\n\nEl condado envía los formularios de renovación a su dirección, así que tenerla al día le ayuda a mantener su Medi-Cal.",
      zh: "如果您搬家、更改邮寄地址，或收入、工作有变化，请在 10 天内通知县政府。\n- 在 BenefitsCal.com 网上报告，或打电话给县政府：San Mateo 1-800-223-8383，Santa Clara 1-877-962-3633。\n- 如果搬到加州的另一个县，您的 Medi-Cal 可以跟着转过去。您需要在新的县选择新的健康计划。\n\n县政府会把续保表格寄到您的地址，所以及时更新地址可以帮助您保住 Medi-Cal。",
      tl: "Sabihan ang county mo sa loob ng 10 araw kapag lumipat ka, nagpalit ng mailing address, o nagbago ang kita o trabaho mo.\n- I-report online sa BenefitsCal.com o tawagan ang county mo: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- Kung lilipat ka sa ibang county sa California, puwedeng sumama ang Medi-Cal mo. Pipili ka ng bagong health plan sa bagong county.\n\nSa address mo ipinapadala ng county ang mga renewal form, kaya ang pag-update nito ay tumutulong para hindi mawala ang Medi-Cal mo.",
      vi: "Hãy báo cho quận trong vòng 10 ngày khi bạn chuyển nhà, đổi địa chỉ nhận thư, hoặc thu nhập hay công việc thay đổi.\n- Báo trên mạng tại BenefitsCal.com hoặc gọi cho quận: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- Nếu bạn chuyển đến quận khác trong California, Medi-Cal có thể chuyển theo bạn. Bạn sẽ chọn chương trình bảo hiểm mới ở quận mới.\n\nQuận gửi mẫu gia hạn đến địa chỉ của bạn, nên cập nhật địa chỉ giúp bạn giữ được Medi-Cal.",
      ko: "이사, 우편 주소 변경, 소득·직장 변경이 있으면 10일 안에 카운티에 알리세요.\n- BenefitsCal.com에서 신고하거나 전화: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- 캘리포니아 다른 카운티로 이사하면 Medi-Cal을 옮길 수 있습니다. 새 카운티에서 새 건강 플랜을 고릅니다.\n\n갱신 양식은 주소로 오므로 주소를 최신으로 유지하면 Medi-Cal을 지키는 데 도움이 됩니다.",
      pt: "Avise o condado em 10 dias se mudar, alterar a morada de correio, ou se a renda ou o emprego mudarem.\n- Reporte online em BenefitsCal.com ou ligue: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- Se mudar para outro condado na Califórnia, o Medi-Cal pode ir consigo. Escolherá um plano de saúde novo no novo condado.\n\nO condado envia formulários de renovação para a sua morada, por isso mantê-la atualizada ajuda a conservar o Medi-Cal.",
    },
  },
  {
    id: "tax-credits-itin",
    topic: "money",
    sourceIds: ["caleitc-itin"],
    question: {
      en: "Can I get tax credits with an ITIN?",
      es: "¿Puedo recibir créditos de impuestos con un ITIN?",
      zh: "用 ITIN 可以申请税收抵免吗？",
      tl: "Puwede ba akong makakuha ng tax credit gamit ang ITIN?",
      vi: "Tôi có thể nhận tín thuế bằng số ITIN không?",
      ko: "ITIN으로 세금 공제를 받을 수 있나요?",
      pt: "Posso receber créditos de imposto com um ITIN?",
    },
    aliases: ["caleitc itin", "tax credit without ssn", "itin tax refund", "ITIN 세금"],
    answer: {
      en: "In California, you can use an ITIN to claim the California Earned Income Tax Credit (CalEITC) and the Young Child Tax Credit. You must file a California tax return (Form 540 with Form FTB 3514). You can get money back even if you owe no tax.\n- For tax year 2025, CalEITC is for people with earned income up to $32,900.\n- The federal EITC requires a Social Security number, so it is not available with an ITIN.\n- Free tax help: VITA sites, 1-800-906-9887 or irs.gov/vita.",
      es: "En California, puede usar un ITIN para pedir el Crédito Tributario por Ingreso del Trabajo de California (CalEITC) y el Crédito Tributario por Hijos Pequeños. Tiene que presentar una declaración de impuestos de California (Formulario 540 con el Formulario FTB 3514). Puede recibir dinero aunque no deba impuestos.\n- Para el año tributario 2025, CalEITC es para personas con ingresos de trabajo de hasta $32,900.\n- El EITC federal pide número de Seguro Social, así que no se puede pedir con un ITIN.\n- Ayuda gratis con impuestos: sitios VITA, 1-800-906-9887 o irs.gov/vita.",
      zh: "在加州，您可以用 ITIN 申请加州劳动所得税抵免（CalEITC）和幼儿税收抵免。您必须提交加州税表（Form 540 和 Form FTB 3514）。即使不欠税，也可能拿到退款。\n- 2025 税务年度，CalEITC 适用于工作收入不超过 $32,900 的人。\n- 联邦 EITC 需要社会安全号码，所以用 ITIN 不能申请。\n- 免费报税帮助：VITA 服务点，1-800-906-9887 或 irs.gov/vita。",
      tl: "Sa California, puwede mong gamitin ang ITIN para i-claim ang California Earned Income Tax Credit (CalEITC) at Young Child Tax Credit. Kailangan mong mag-file ng California tax return (Form 540 kasama ang Form FTB 3514). Puwede kang makakuha ng pera kahit wala kang utang na tax.\n- Para sa tax year 2025, ang CalEITC ay para sa may kinita sa trabaho na hanggang $32,900.\n- Kailangan ng Social Security number ang federal EITC, kaya hindi ito makukuha gamit ang ITIN.\n- Libreng tulong sa tax: mga VITA site, 1-800-906-9887 o irs.gov/vita.",
      vi: "Ở California, bạn có thể dùng số ITIN để xin Tín Thuế Thu Nhập California (CalEITC) và Tín Thuế Trẻ Nhỏ. Bạn phải nộp tờ khai thuế California (Mẫu 540 kèm Mẫu FTB 3514). Bạn có thể nhận tiền về dù không nợ thuế.\n- Cho năm thuế 2025, CalEITC dành cho người có thu nhập từ việc làm tối đa $32,900.\n- Tín thuế EITC liên bang cần số An Sinh Xã Hội, nên không thể xin bằng ITIN.\n- Trợ giúp khai thuế miễn phí: các điểm VITA, 1-800-906-9887 hoặc irs.gov/vita.",
      ko: "캘리포니아에서는 ITIN으로 CalEITC(근로소득세 공제)와 Young Child Tax Credit을 신청할 수 있습니다. 캘리포니아 세금 신고서(Form 540과 FTB 3514)를 제출해야 합니다. 세금이 없어도 환급을 받을 수 있습니다.\n- 2025 과세연도 CalEITC는 근로소득 $32,900까지입니다.\n- 연방 EITC는 사회보장번호가 필요해 ITIN으로는 받을 수 없습니다.\n- 무료 세금 도움: VITA, 1-800-906-9887 또는 irs.gov/vita.",
      pt: "Na Califórnia, pode usar um ITIN para pedir o CalEITC e o Young Child Tax Credit. Tem de apresentar a declaração de impostos da Califórnia (Formulário 540 com FTB 3514). Pode receber dinheiro mesmo sem dever imposto.\n- Para o ano fiscal 2025, o CalEITC é para quem tem renda do trabalho até $32,900.\n- O EITC federal exige número de Seguro Social, por isso não está disponível com ITIN.\n- Ajuda gratuita com impostos: locais VITA, 1-800-906-9887 ou irs.gov/vita.",
    },
  },
  {
    id: "confusing-letter",
    topic: "health",
    sourceIds: ["medi-cal-notices"],
    question: {
      en: "I got a letter I don't understand.",
      es: "Recibí una carta que no entiendo.",
      zh: "我收到一封看不懂的信。",
      tl: "May natanggap akong sulat na hindi ko maintindihan.",
      vi: "Tôi nhận được một lá thư mà tôi không hiểu.",
      ko: "이해할 수 없는 편지를 받았습니다.",
      pt: "Recebi uma carta que não entendo.",
    },
    aliases: ["confusing letter", "what does this notice mean", "yellow envelope letter", "carta confusa"],
    answer: {
      en: "Look for three things on the letter: the date it was mailed, the due date, and what it asks you to send or do. Do it before the due date.\n- A yellow envelope is usually a Medi-Cal renewal form.\n- A Notice of Action tells you about a decision. If you disagree, you have 90 days from the date on the notice to ask for a State Hearing: (800) 743-8525.\n\nYou can also take a photo of the letter in the Letter tab, and Costa will explain it in your language.",
      es: "Busque tres cosas en la carta: la fecha en que se envió, la fecha límite y lo que le pide enviar o hacer. Hágalo antes de la fecha límite.\n- Un sobre amarillo casi siempre es un formulario de renovación de Medi-Cal.\n- Un Aviso de Acción le informa sobre una decisión. Si no está de acuerdo, tiene 90 días desde la fecha del aviso para pedir una Audiencia Estatal: (800) 743-8525.\n\nTambién puede tomarle una foto a la carta en la sección Carta, y Costa se la explica en su idioma.",
      zh: "请在信上找三样东西：寄出日期、截止日期，以及信上要求您寄送或做什么。请在截止日期前办好。\n- 黄色信封通常是 Medi-Cal 续保表格。\n- 行动通知（Notice of Action）是告诉您一个决定。如果您不同意，可以在通知日期起 90 天内要求州听证会：(800) 743-8525。\n\n您也可以在“信件”页面给信拍照，Costa 会用您的语言解释。",
      tl: "Hanapin ang tatlong bagay sa sulat: ang petsa na ipinadala ito, ang deadline, at kung ano ang hinihingi nitong ipadala o gawin. Gawin ito bago ang deadline.\n- Ang dilaw na sobre ay kadalasang renewal form ng Medi-Cal.\n- Ang Notice of Action ay nagsasabi tungkol sa isang desisyon. Kung hindi ka sang-ayon, may 90 araw ka mula sa petsa ng notice para humingi ng State Hearing: (800) 743-8525.\n\nPuwede mo ring kunan ng litrato ang sulat sa tab na Sulat, at ipapaliwanag ito ni Costa sa iyong wika.",
      vi: "Hãy tìm ba điều trên thư: ngày gửi thư, hạn chót, và thư yêu cầu bạn gửi hay làm gì. Hãy làm trước hạn chót.\n- Phong bì màu vàng thường là mẫu gia hạn Medi-Cal.\n- Thông Báo Hành Động (Notice of Action) cho bạn biết về một quyết định. Nếu không đồng ý, bạn có 90 ngày kể từ ngày ghi trên thư báo để xin Phiên Điều Trần Tiểu Bang: (800) 743-8525.\n\nBạn cũng có thể chụp ảnh lá thư trong mục Thư, và Costa sẽ giải thích bằng ngôn ngữ của bạn.",
      ko: "편지에서 세 가지를 찾으세요: 발송일, 마감일, 보내거나 해야 할 일. 마감일 전에 하세요.\n- 노란색 봉투는 보통 Medi-Cal 갱신 양식입니다.\n- Notice of Action은 결정을 알립니다. 동의하지 않으면 안내문 날짜부터 90일 안에 주 청문회: (800) 743-8525.\n\nLetter 탭에서 편지를 사진으로 찍으면 Costa가 사용 언어로 설명해 드립니다.",
      pt: "Procure três coisas na carta: a data de envio, o prazo e o que pede para enviar ou fazer. Faça antes do prazo.\n- Um envelope amarelo costuma ser formulário de renovação do Medi-Cal.\n- Um Aviso de Ação informa uma decisão. Se discordar, tem 90 dias a partir da data do aviso para pedir Audiência Estadual: (800) 743-8525.\n\nTambém pode fotografar a carta no separador Carta, e a Costa explica no seu idioma.",
    },
  },
];

const DISASTER_FAQS: Faq[] = [
  {
    id: "disaster-help",
    topic: "disaster",
    sourceIds: ["disaster-assistance"],
    question: {
      en: "How do I get help after a disaster?",
      es: "¿Cómo recibo ayuda después de un desastre?",
      zh: "发生灾害后怎么获得帮助？",
      tl: "Paano makakuha ng tulong pagkatapos ng sakuna?",
      vi: "Làm sao để nhận trợ giúp sau thiên tai?",
      ko: "재난 후 도움은 어떻게 받나요?",
      pt: "Como recebo ajuda depois de um desastre?",
    },
    aliases: ["fema help", "disaster assistance", "after the fire", "after the flood", "재난 지원"],
    answer: {
      en: "If the President declares a disaster for your area, FEMA may give money and services.\n- Apply at DisasterAssistance.gov, with the FEMA App, or call 1-800-621-3362. It is open 7 days a week, with help in most languages.\n- In a household with mixed immigration status, one person who qualifies is enough, including a child under 18. A parent can apply for the child and does not have to give any information about their own status.\n- For shelters, food, and local recovery help, dial 211.",
      es: "Si el Presidente declara un desastre en su área, FEMA puede dar dinero y servicios.\n- Solicite en DisasterAssistance.gov, con la aplicación de FEMA o llame al 1-800-621-3362. Está abierto los 7 días de la semana, con ayuda en la mayoría de los idiomas.\n- En una familia con estatus migratorio mixto, basta con una persona que califique, incluso un niño menor de 18 años. Un padre o madre puede solicitar por el niño y no tiene que dar información sobre su propio estatus.\n- Para refugios, comida y ayuda local para recuperarse, marque 211.",
      zh: "如果总统宣布您所在地区发生灾害，FEMA 可能提供钱和服务。\n- 在 DisasterAssistance.gov 网上申请、用 FEMA App，或拨打 1-800-621-3362。每周 7 天开放，提供大多数语言的帮助。\n- 如果家庭成员的移民身份不同，只要有一个人合资格就可以，包括 18 岁以下的孩子。父母可以代孩子申请，不需要提供自己身份的任何信息。\n- 需要避难所、食物和本地灾后帮助，请拨打 211。",
      tl: "Kung magdeklara ang Presidente ng sakuna sa lugar mo, puwedeng magbigay ang FEMA ng pera at serbisyo.\n- Mag-apply sa DisasterAssistance.gov, sa FEMA App, o tumawag sa 1-800-621-3362. Bukas ito 7 araw sa isang linggo, may tulong sa karamihan ng wika.\n- Sa pamilyang magkakaiba ang immigration status, sapat na ang isang taong pasok, kasama ang batang wala pang 18 taon. Puwedeng mag-apply ang magulang para sa bata at hindi niya kailangang magbigay ng impormasyon tungkol sa sarili niyang status.\n- Para sa shelter, pagkain, at lokal na tulong sa pagbangon, i-dial ang 211.",
      vi: "Nếu Tổng Thống công bố thiên tai tại khu vực của bạn, FEMA có thể cấp tiền và dịch vụ.\n- Nộp đơn tại DisasterAssistance.gov, qua ứng dụng FEMA, hoặc gọi 1-800-621-3362. Mở cửa 7 ngày mỗi tuần, có trợ giúp bằng hầu hết các ngôn ngữ.\n- Trong gia đình có tình trạng di trú khác nhau, chỉ cần một người hội đủ, kể cả trẻ dưới 18 tuổi. Cha mẹ có thể nộp đơn thay cho con và không phải cung cấp thông tin gì về tình trạng của chính mình.\n- Để tìm nơi trú ẩn, thực phẩm và trợ giúp phục hồi tại địa phương, hãy gọi 211.",
      ko: "대통령이 해당 지역에 재난을 선포하면 FEMA가 금전과 서비스를 줄 수 있습니다.\n- DisasterAssistance.gov, FEMA 앱, 또는 1-800-621-3362로 신청하세요. 주 7일 운영, 대부분 언어 지원.\n- 이민 신분이 섞인 가구에서는 자격 있는 한 명이면 됩니다(18세 미만 아동 포함). 부모가 자녀를 위해 신청할 수 있으며 본인 신분을 밝힐 필요는 없습니다.\n- 대피소·식량·지역 복구 도움은 211.",
      pt: "Se o Presidente declarar desastre na sua área, a FEMA pode dar dinheiro e serviços.\n- Peça em DisasterAssistance.gov, na app FEMA, ou ligue 1-800-621-3362. Aberto 7 dias por semana, com ajuda na maioria das línguas.\n- Numa família com status migratório misto, basta uma pessoa que se qualifique, incluindo uma criança menor de 18 anos. Um pai ou mãe pode pedir pela criança e não tem de dar informação sobre o próprio status.\n- Para abrigos, comida e ajuda local de recuperação, marque 211.",
    },
  },
  {
    id: "food-spoiled",
    topic: "disaster",
    sourceIds: ["disaster-assistance"],
    question: {
      en: "My food spoiled in a power outage. Can CalFresh replace it?",
      es: "Mi comida se echó a perder en un apagón. ¿CalFresh la puede reponer?",
      zh: "停电让我的食物坏了，CalFresh 可以补回吗？",
      tl: "Nasira ang pagkain ko dahil sa brownout. Mapapalitan ba ito ng CalFresh?",
      vi: "Thực phẩm của tôi bị hỏng vì mất điện. CalFresh có bù lại không?",
      ko: "정전으로 음식이 상했습니다. CalFresh로 대체받을 수 있나요?",
      pt: "A minha comida estragou num apagão. O CalFresh pode repor?",
    },
    aliases: ["food spoiled power outage", "replace calfresh food", "CF 303", "comida echada a perder"],
    answer: {
      en: "If food you bought with CalFresh was destroyed or spoiled because of a disaster, fire, flood, or power outage, you can ask for replacement benefits.\n1. Call your county at 1-877-847-3663.\n2. Fill out, sign, and turn in form CF 303. Say what happened and the date and time of the outage.\n3. Ask within 10 days of the food loss. After big disasters, the state sometimes gives more time.",
      es: "Si la comida que compró con CalFresh se destruyó o se echó a perder por un desastre, incendio, inundación o apagón, puede pedir que le repongan los beneficios.\n1. Llame a su condado al 1-877-847-3663.\n2. Llene, firme y entregue el formulario CF 303. Diga qué pasó y la fecha y hora del apagón.\n3. Pídalo dentro de 10 días de haber perdido la comida. Después de desastres grandes, el estado a veces da más tiempo.",
      zh: "如果您用 CalFresh 买的食物因为灾害、火灾、水灾或停电而损坏，您可以申请补发福利。\n1. 打电话给县政府：1-877-847-3663。\n2. 填写、签名并交回 CF 303 表格。写明发生了什么，以及停电的日期和时间。\n3. 请在食物损失后 10 天内申请。发生大灾害后，州政府有时会延长时间。",
      tl: "Kung nasira o napanis ang pagkaing binili mo gamit ang CalFresh dahil sa sakuna, sunog, baha, o brownout, puwede kang humingi ng kapalit na benepisyo.\n1. Tawagan ang county mo sa 1-877-847-3663.\n2. Sagutan, pirmahan, at ipasa ang form CF 303. Sabihin kung ano ang nangyari at ang petsa at oras ng brownout.\n3. Humingi sa loob ng 10 araw mula nang masira ang pagkain. Pagkatapos ng malalaking sakuna, minsan nagbibigay ang estado ng mas mahabang panahon.",
      vi: "Nếu thực phẩm bạn mua bằng CalFresh bị hư hỏng vì thiên tai, cháy, lụt hoặc mất điện, bạn có thể xin cấp bù phúc lợi.\n1. Gọi cho quận số 1-877-847-3663.\n2. Điền, ký và nộp mẫu CF 303. Ghi rõ chuyện gì đã xảy ra và ngày giờ mất điện.\n3. Hãy xin trong vòng 10 ngày kể từ khi mất thực phẩm. Sau những thiên tai lớn, tiểu bang đôi khi cho thêm thời gian.",
      ko: "CalFresh로 산 음식이 재난·화재·홍수·정전으로 상했다면 대체 혜택을 요청할 수 있습니다.\n1. 카운티에 전화: 1-877-847-3663.\n2. CF 303 양식을 작성·서명·제출하고 정전 날짜·시간을 적으세요.\n3. 음식 손실 후 10일 안에 신청하세요. 큰 재난 후에는 주가 기한을 늘리기도 합니다.",
      pt: "Se a comida comprada com CalFresh foi destruída ou estragou por desastre, incêndio, inundação ou apagão, pode pedir benefícios de substituição.\n1. Ligue ao condado: 1-877-847-3663.\n2. Preencha, assine e entregue o formulário CF 303. Digue o que aconteceu e a data e hora do apagão.\n3. Peça em 10 dias após a perda. Depois de grandes desastres, o estado às vezes dá mais tempo.",
    },
  },
];

const EXTRA_FAQS: Faq[] = [
  {
    id: "lost-job-kids",
    topic: "health",
    sourceIds: ["medi-cal-apply", "calfresh", "wic"],
    aliases: [
      "husband lost his job",
      "lost my job what can we get",
      "unemployed with children benefits",
      "perdi el trabajo ayuda",
      "실직 혜택",
    ],
    question: {
      en: "Someone in my family lost a job. What benefits can we get?",
      es: "Alguien en mi familia perdió el trabajo. ¿Qué beneficios podemos recibir?",
      zh: "家里有人失业了，我们可以申请哪些福利？",
      tl: "May nawalan ng trabaho sa pamilya ko. Anong benepisyo ang puwede naming makuha?",
      vi: "Người trong gia đình tôi mất việc. Chúng tôi có thể nhận phúc lợi gì?",
      ko: "가족 중 누군가 실직했습니다. 어떤 혜택을 받을 수 있나요?",
      pt: "Alguém da minha família perdeu o emprego. Que benefícios podemos receber?",
    },
    answer: {
      en: "After a job loss, many families apply for Medi-Cal (health coverage) and CalFresh (food money on an EBT card).\n- Apply for both at BenefitsCal.com, or call San Mateo 1-800-223-8383 / Santa Clara 1-877-962-3633.\n- If someone is pregnant or you care for a child under 5, also ask about WIC: 1-800-852-5770.\n- Only the county can decide who qualifies. Costa can walk you through a short checkup on the Check tab to see what may fit your household.",
      es: "Después de perder un trabajo, muchas familias solicitan Medi-Cal (seguro de salud) y CalFresh (dinero para comida en una tarjeta EBT).\n- Solicite ambos en BenefitsCal.com, o llame a San Mateo 1-800-223-8383 / Santa Clara 1-877-962-3633.\n- Si alguien está embarazada o cuida a un niño menor de 5 años, pregunte también por WIC: 1-800-852-5770.\n- Solo el condado decide quién califica. En la pestaña Revisar, Costa puede guiarle en unas preguntas cortas.",
      zh: "失业后，很多家庭会申请 Medi-Cal（医疗保险）和 CalFresh（EBT 卡上的食品补助）。\n- 可在 BenefitsCal.com 同时申请，或致电 San Mateo 1-800-223-8383 / Santa Clara 1-877-962-3633。\n- 如有人怀孕或您照顾 5 岁以下儿童，也可询问 WIC：1-800-852-5770。\n- 只有县政府能决定谁合资格。可在“查询”页用 Costa 的简短问卷看看可能适合的项目。",
      tl: "Pagkatapos mawalan ng trabaho, maraming pamilya ang nag-a-apply sa Medi-Cal (health coverage) at CalFresh (pera para sa pagkain sa EBT card).\n- Mag-apply sa pareho sa BenefitsCal.com, o tumawag sa San Mateo 1-800-223-8383 / Santa Clara 1-877-962-3633.\n- Kung may buntis o may batang wala pang 5 taon, magtanong din tungkol sa WIC: 1-800-852-5770.\n- Ang county lang ang magpapasya kung sino ang pasok. Sa Check tab, puwedeng gabayan ka ni Costa sa maikling checkup.",
      vi: "Sau khi mất việc, nhiều gia đình nộp đơn Medi-Cal (bảo hiểm y tế) và CalFresh (tiền thực phẩm trên thẻ EBT).\n- Nộp cả hai tại BenefitsCal.com, hoặc gọi San Mateo 1-800-223-8383 / Santa Clara 1-877-962-3633.\n- Nếu có người mang thai hoặc bạn chăm trẻ dưới 5 tuổi, hỏi thêm WIC: 1-800-852-5770.\n- Chỉ quận quyết định ai đủ điều kiện. Ở thẻ Kiểm tra, Costa có thể hỏi vài câu ngắn để gợi ý chương trình phù hợp.",
      ko: "실직 후 많은 가정이 Medi-Cal(의료)과 CalFresh(EBT 카드 식비)를 신청합니다.\n- BenefitsCal.com에서 둘 다 신청하거나 San Mateo 1-800-223-8383 / Santa Clara 1-877-962-3633로 전화하세요.\n- 임신 중이거나 5세 미만 아동을 돌보면 WIC도 문의하세요: 1-800-852-5770.\n- 자격은 카운티만 결정합니다. Check 탭에서 Costa 짧은 점검으로 맞는 프로그램을 볼 수 있습니다.",
      pt: "Depois de perder o emprego, muitas famílias pedem Medi-Cal (saúde) e CalFresh (dinheiro para comida no cartão EBT).\n- Peça os dois em BenefitsCal.com, ou ligue San Mateo 1-800-223-8383 / Santa Clara 1-877-962-3633.\n- Se alguém está grávida ou você cuida de criança menor de 5 anos, pergunte também sobre WIC: 1-800-852-5770.\n- Só o condado decide quem se qualifica. Na aba Check, a Costa pode fazer perguntas curtas para ver o que pode servir.",
    },
  },
  {
    id: "state-hearing",
    topic: "health",
    sourceIds: ["medi-cal-lost-coverage", "medi-cal-notices"],
    aliases: ["appeal medi-cal", "state hearing", "audiencia estatal", "how to appeal denial"],
    question: {
      en: "How do I ask for a State Hearing?",
      es: "¿Cómo pido una Audiencia Estatal?",
      zh: "怎么申请州听证会？",
      tl: "Paano humingi ng State Hearing?",
      vi: "Làm sao để xin Phiên Điều Trần Tiểu Bang?",
      ko: "주 청문회(State Hearing)는 어떻게 신청하나요?",
      pt: "Como peço uma Audiência Estadual?",
    },
    answer: {
      en: "If you disagree with a county decision about Medi-Cal or CalFresh, you can ask for a State Hearing.\n- You usually have 90 days from the date on the Notice of Action.\n- Call (800) 743-8525, or follow the hearing request instructions on the notice.\n- Free help with Medi-Cal problems: Health Consumer Alliance, 1-888-804-3536.\n\nAsking for a hearing does not guarantee a change. Keep copies of everything you send.",
      es: "Si no está de acuerdo con una decisión del condado sobre Medi-Cal o CalFresh, puede pedir una Audiencia Estatal.\n- Por lo general tiene 90 días desde la fecha del Aviso de Acción.\n- Llame al (800) 743-8525, o siga las instrucciones del aviso.\n- Ayuda gratis con problemas de Medi-Cal: Health Consumer Alliance, 1-888-804-3536.\n\nPedir una audiencia no garantiza un cambio. Guarde copias de todo lo que envíe.",
      zh: "如果您不同意县政府对 Medi-Cal 或 CalFresh 的决定，可以申请州听证会。\n- 通常从行动通知（Notice of Action）上的日期起有 90 天。\n- 拨打 (800) 743-8525，或按通知上的说明申请。\n- Medi-Cal 问题免费帮助：Health Consumer Alliance，1-888-804-3536。\n\n申请听证并不保证结果会改变。请保留所有寄出材料的副本。",
      tl: "Kung hindi ka sang-ayon sa desisyon ng county tungkol sa Medi-Cal o CalFresh, puwede kang humingi ng State Hearing.\n- Karaniwang may 90 araw ka mula sa petsa sa Notice of Action.\n- Tumawag sa (800) 743-8525, o sundan ang instructions sa notice.\n- Libreng tulong sa Medi-Cal: Health Consumer Alliance, 1-888-804-3536.\n\nAng paghingi ng hearing ay hindi garantisadong magbabago ang desisyon. Mag-keep ng kopya ng lahat ng ipinadala mo.",
      vi: "Nếu bạn không đồng ý với quyết định của quận về Medi-Cal hoặc CalFresh, bạn có thể xin Phiên Điều Trần Tiểu Bang.\n- Thường có 90 ngày kể từ ngày trên Thông Báo Hành Động.\n- Gọi (800) 743-8525, hoặc làm theo hướng dẫn trên thư.\n- Trợ giúp miễn phí về Medi-Cal: Health Consumer Alliance, 1-888-804-3536.\n\nXin điều trần không đảm bảo thay đổi kết quả. Hãy giữ bản sao mọi giấy tờ bạn gửi.",
      ko: "Medi-Cal 또는 CalFresh에 대한 카운티 결정에 동의하지 않으면 주 청문회를 신청할 수 있습니다.\n- 보통 Notice of Action 날짜로부터 90일 이내입니다.\n- (800) 743-8525로 전화하거나 안내문의 절차를 따르세요.\n- Medi-Cal 문제 무료 도움: Health Consumer Alliance, 1-888-804-3536.\n\n청문회 신청이 결과 변경을 보장하지는 않습니다. 보낸 서류 사본을 보관하세요.",
      pt: "Se discordar de uma decisão do condado sobre Medi-Cal ou CalFresh, pode pedir uma Audiência Estadual.\n- Em geral tem 90 dias a partir da data no Aviso de Ação.\n- Ligue (800) 743-8525, ou siga as instruções do aviso.\n- Ajuda gratuita com Medi-Cal: Health Consumer Alliance, 1-888-804-3536.\n\nPedir audiência não garante mudança. Guarde cópias de tudo que enviar.",
    },
  },
  {
    id: "ebt-card",
    topic: "food",
    sourceIds: ["calfresh"],
    aliases: ["lost ebt card", "replace ebt", "tarjeta ebt perdida", "how to use ebt"],
    question: {
      en: "I lost my EBT card. What do I do?",
      es: "Perdí mi tarjeta EBT. ¿Qué hago?",
      zh: "我的 EBT 卡丢了，怎么办？",
      tl: "Nawala ang EBT card ko. Ano ang gagawin ko?",
      vi: "Tôi mất thẻ EBT. Tôi phải làm gì?",
      ko: "EBT 카드를 잃어버렸습니다. 어떻게 하나요?",
      pt: "Perdi o cartão EBT. O que faço?",
    },
    answer: {
      en: "Call the EBT Customer Service number on the back of your card right away to cancel a lost or stolen card and ask for a replacement.\n- Your CalFresh benefits stay in your account; the card is only how you spend them.\n- For questions about your CalFresh case, call 1-877-847-3663.",
      es: "Llame de inmediato al servicio de EBT que aparece al reverso de su tarjeta para cancelar una tarjeta perdida o robada y pedir un reemplazo.\n- Sus beneficios de CalFresh siguen en su cuenta; la tarjeta solo es la forma de usarlos.\n- Para preguntas sobre su caso de CalFresh, llame al 1-877-847-3663.",
      zh: "请马上拨打卡背面的 EBT 客服电话，挂失并申请补卡。\n- CalFresh 福利仍在账户里；卡只是使用方式。\n- 关于 CalFresh 案件问题，请拨打 1-877-847-3663。",
      tl: "Agad na tawagan ang EBT Customer Service sa likod ng card para i-cancel ang nawala o ninakaw na card at humingi ng kapalit.\n- Nananatili sa account mo ang CalFresh benefits; ang card ay para lang magamit ito.\n- Para sa tanong tungkol sa CalFresh case mo, tumawag sa 1-877-847-3663.",
      vi: "Hãy gọi ngay số dịch vụ EBT ở mặt sau thẻ để khóa thẻ mất/bị đánh cắp và xin thẻ mới.\n- Phúc lợi CalFresh vẫn trong tài khoản; thẻ chỉ là cách chi tiêu.\n- Hỏi về hồ sơ CalFresh: gọi 1-877-847-3663.",
      ko: "카드 뒷면 EBT 고객센터로 바로 전화해 분실·도난 카드를 정지하고 재발급을 요청하세요.\n- CalFresh 혜택은 계정에 그대로 있고, 카드는 사용 수단일 뿐입니다.\n- CalFresh 사례 문의: 1-877-847-3663.",
      pt: "Ligue imediatamente para o atendimento EBT no verso do cartão para cancelar um cartão perdido ou roubado e pedir outro.\n- Os benefícios CalFresh ficam na conta; o cartão é só a forma de gastar.\n- Dúvidas sobre o caso CalFresh: 1-877-847-3663.",
    },
  },
  {
    id: "immigration-kids",
    topic: "health",
    sourceIds: ["medi-cal-apply"],
    aliases: ["undocumented children medi-cal", "kids immigration status medi-cal", "niños sin papeles medi-cal"],
    question: {
      en: "Can my children get Medi-Cal if we don't have papers?",
      es: "¿Mis hijos pueden recibir Medi-Cal si no tenemos papeles?",
      zh: "如果我们没有身份文件，孩子还能申请 Medi-Cal 吗？",
      tl: "Puwede bang magka-Medi-Cal ang mga anak ko kung wala kaming papeles?",
      vi: "Con tôi có được Medi-Cal nếu chúng tôi không có giấy tờ không?",
      ko: "서류가 없어도 자녀가 Medi-Cal을 받을 수 있나요?",
      pt: "Meus filhos podem ter Medi-Cal se não tivermos documentos?",
    },
    answer: {
      en: "Children under 19 can get full Medi-Cal no matter their immigration status, if they meet the income rules. Pregnant people can also get full Medi-Cal regardless of immigration status, if they meet the income rules.\n- Apply at BenefitsCal.com or call your county: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- Costa never asks about immigration status. Only the county decides who qualifies.",
      es: "Los niños menores de 19 años pueden recibir Medi-Cal completo sin importar su estatus migratorio, si cumplen las reglas de ingresos. Las personas embarazadas también pueden recibir Medi-Cal completo sin importar el estatus migratorio, si cumplen las reglas de ingresos.\n- Solicite en BenefitsCal.com o llame a su condado: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- Costa nunca pregunta sobre estatus migratorio. Solo el condado decide quién califica.",
      zh: "19 岁以下儿童只要符合收入规定，不论移民身份都可以获得全面 Medi-Cal。怀孕的人只要符合收入规定，也不论移民身份可以获得全面 Medi-Cal。\n- 在 BenefitsCal.com 申请，或致电县政府：San Mateo 1-800-223-8383，Santa Clara 1-877-962-3633。\n- Costa 从不询问移民身份。只有县政府决定谁合资格。",
      tl: "Ang mga batang wala pang 19 taon ay puwedeng makakuha ng buong Medi-Cal anuman ang immigration status, kung pasok sa income rules. Ang mga buntis ay puwede ring makakuha ng buong Medi-Cal anuman ang immigration status, kung pasok sa income rules.\n- Mag-apply sa BenefitsCal.com o tawagan ang county: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- Hindi nagtatanong si Costa tungkol sa immigration status. Ang county lang ang nagpapasya.",
      vi: "Trẻ dưới 19 tuổi có thể nhận Medi-Cal đầy đủ bất kể tình trạng di trú, nếu đáp ứng quy định thu nhập. Người mang thai cũng có thể nhận Medi-Cal đầy đủ bất kể tình trạng di trú, nếu đáp ứng quy định thu nhập.\n- Nộp đơn tại BenefitsCal.com hoặc gọi quận: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- Costa không bao giờ hỏi về tình trạng di trú. Chỉ quận quyết định ai đủ điều kiện.",
      ko: "19세 미만 아동은 소득 요건만 충족하면 이민 신분과 상관없이 전체 Medi-Cal을 받을 수 있습니다. 임산부도 소득 요건을 충족하면 이민 신분과 상관없이 전체 Medi-Cal을 받을 수 있습니다.\n- BenefitsCal.com에서 신청하거나 카운티에 전화하세요: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- Costa는 이민 신분을 묻지 않습니다. 자격은 카운티만 결정합니다.",
      pt: "Crianças menores de 19 anos podem ter Medi-Cal completo independentemente do status migratório, se cumprirem as regras de renda. Pessoas grávidas também podem ter Medi-Cal completo independentemente do status migratório, se cumprirem as regras de renda.\n- Peça em BenefitsCal.com ou ligue ao condado: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- A Costa nunca pergunta sobre status migratório. Só o condado decide quem se qualifica.",
    },
  },
  {
    id: "covered-california",
    topic: "health",
    sourceIds: ["medi-cal-apply"],
    aliases: ["covered ca", "covered california", "cheap health insurance california"],
    question: {
      en: "What if I don't qualify for Medi-Cal?",
      es: "¿Qué pasa si no califico para Medi-Cal?",
      zh: "如果我不符合 Medi-Cal 资格怎么办？",
      tl: "Paano kung hindi ako pasok sa Medi-Cal?",
      vi: "Nếu tôi không đủ điều kiện Medi-Cal thì sao?",
      ko: "Medi-Cal 자격이 안 되면 어떻게 하나요?",
      pt: "E se eu não me qualificar para o Medi-Cal?",
    },
    answer: {
      en: "If Medi-Cal is not an option, Covered California can help lower the cost of private health insurance.\n- Learn more or apply at CoveredCA.com, or call 1-800-300-1506.\n- Only the county or Covered California can decide eligibility. Costa gives general information from official sources.",
      es: "Si Medi-Cal no es una opción, Covered California puede ayudar a bajar el costo de un seguro médico privado.\n- Más información o solicitud en CoveredCA.com, o llame al 1-800-300-1506.\n- Solo el condado o Covered California deciden la elegibilidad. Costa da información general de fuentes oficiales.",
      zh: "如果无法申请 Medi-Cal，Covered California 可以帮助降低私人医疗保险费用。\n- 详情或申请：CoveredCA.com，或拨打 1-800-300-1506。\n- 只有县政府或 Covered California 能决定资格。Costa 只提供来自官方资料的一般信息。",
      tl: "Kung hindi option ang Medi-Cal, matutulungan ka ng Covered California na babaan ang gastos ng private health insurance.\n- Alamin o mag-apply sa CoveredCA.com, o tumawag sa 1-800-300-1506.\n- Ang county o Covered California lang ang magpapasya sa eligibility. Nagbibigay si Costa ng pangkalahatang impormasyon mula sa opisyal na source.",
      vi: "Nếu Medi-Cal không phải lựa chọn, Covered California có thể giúp giảm chi phí bảo hiểm tư.\n- Tìm hiểu hoặc nộp đơn tại CoveredCA.com, hoặc gọi 1-800-300-1506.\n- Chỉ quận hoặc Covered California quyết định điều kiện. Costa chỉ cung cấp thông tin chung từ nguồn chính thức.",
      ko: "Medi-Cal이 어렵다면 Covered California가 민간 건강보험 비용을 낮추는 데 도움이 될 수 있습니다.\n- CoveredCA.com에서 알아보거나 신청하세요. 전화 1-800-300-1506.\n- 자격 결정은 카운티 또는 Covered California만 합니다. Costa는 공식 자료의 일반 정보만 제공합니다.",
      pt: "Se o Medi-Cal não for opção, o Covered California pode ajudar a baixar o custo de um plano privado.\n- Saiba mais ou peça em CoveredCA.com, ou ligue 1-800-300-1506.\n- Só o condado ou o Covered California decide a elegibilidade. A Costa dá informação geral de fontes oficiais.",
    },
  },
  {
    id: "calfresh-how-long",
    topic: "food",
    sourceIds: ["calfresh"],
    aliases: ["how long does calfresh take", "when do I get ebt", "calfresh approval time", "cuanto tarda calfresh"],
    question: {
      en: "How long does it take to get CalFresh?",
      es: "¿Cuánto tarda CalFresh?",
      zh: "申请 CalFresh 要多久？",
      tl: "Gaano katagal bago makuha ang CalFresh?",
      vi: "Mất bao lâu để nhận CalFresh?",
      ko: "CalFresh는 얼마나 걸리나요?",
      pt: "Quanto tempo demora o CalFresh?",
    },
    answer: {
      en: "Many CalFresh applications are decided within 30 days. If your household has little or no money for food, ask about expedited service — some cases can get an EBT card within a few days.\n- Apply at BenefitsCal.com or call 1-877-847-3663.\n- Keep your interview appointment and send any proof the county asks for.\n- Only the county can say how long your case will take.",
      es: "Muchas solicitudes de CalFresh se deciden en 30 días. Si su hogar tiene poca o ninguna plata para comida, pregunte por el servicio acelerado: en algunos casos la tarjeta EBT llega en pocos días.\n- Solicite en BenefitsCal.com o llame al 1-877-847-3663.\n- Acuda a la entrevista y envíe las pruebas que pida el condado.\n- Solo el condado puede decir cuánto tardará su caso.",
      zh: "许多 CalFresh 申请会在 30 天内出结果。如果家里几乎没有钱买食物，可以询问加急服务——有些情况几天内就能拿到 EBT 卡。\n- 在 BenefitsCal.com 申请，或拨打 1-877-847-3663。\n- 请准时参加面谈，并提交县政府要求的证明。\n- 只有县政府能说明您的个案需要多久。",
      tl: "Maraming CalFresh application ang nadedesisyon sa loob ng 30 araw. Kung konti o wala nang pera ang pamilya para sa pagkain, magtanong tungkol sa expedited service — may mga kasong makakakuha ng EBT card sa loob ng ilang araw.\n- Mag-apply sa BenefitsCal.com o tumawag sa 1-877-847-3663.\n- Dumalo sa interview at ipadala ang proof na hinihingi ng county.\n- Ang county lang ang makakapagsabi kung gaano katagal ang kaso mo.",
      vi: "Nhiều đơn CalFresh được quyết trong 30 ngày. Nếu nhà gần như không còn tiền mua thức ăn, hãy hỏi dịch vụ nhanh — một số trường hợp nhận thẻ EBT trong vài ngày.\n- Nộp đơn tại BenefitsCal.com hoặc gọi 1-877-847-3663.\n- Giữ buổi phỏng vấn và gửi giấy tờ quận yêu cầu.\n- Chỉ quận mới nói được hồ sơ của bạn mất bao lâu.",
      ko: "많은 CalFresh 신청은 30일 안에 결정됩니다. 식비가 거의 없으면 긴급 처리를 문의하세요 — 며칠 안에 EBT 카드를 받는 경우도 있습니다.\n- BenefitsCal.com에서 신청하거나 1-877-847-3663로 전화하세요.\n- 면접을 지키고 카운티가 요청한 증빙을 보내세요.\n- 처리 기간은 카운티만 알려줄 수 있습니다.",
      pt: "Muitos pedidos de CalFresh são decididos em 30 dias. Se a casa tem pouco ou nenhum dinheiro para comida, pergunte pelo serviço acelerado — em alguns casos o cartão EBT chega em poucos dias.\n- Peça em BenefitsCal.com ou ligue 1-877-847-3663.\n- Compareça à entrevista e envie as provas que o condado pedir.\n- Só o condado pode dizer quanto o seu caso vai demorar.",
    },
  },
  {
    id: "in-person-help",
    topic: "health",
    sourceIds: ["medi-cal-apply", "calfresh"],
    aliases: ["talk to a real person", "help filling forms", "enrollment helper", "someone to help me apply"],
    question: {
      en: "Where can I get in-person help applying?",
      es: "¿Dónde consigo ayuda en persona para solicitar?",
      zh: "去哪里可以当面申请协助？",
      tl: "Saan ako makakakuha ng personal na tulong sa pag-a-apply?",
      vi: "Tôi có thể nhận trợ giúp trực tiếp để nộp đơn ở đâu?",
      ko: "신청을 도와줄 대면 지원은 어디서 받나요?",
      pt: "Onde posso ter ajuda presencial para pedir?",
    },
    answer: {
      en: "You can get free help applying without figuring everything out alone.\n- Call your county: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- Dial 211 for local community organizations that help with benefits paperwork.\n- On Costa, open Help to find nearby options, or Ask to request a person follow-up.\n\nOnly the county decides who qualifies. Helpers can guide you; they do not approve your case.",
      es: "Puede recibir ayuda gratis para solicitar sin tener que hacerlo solo.\n- Llame a su condado: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- Marque 211 para organizaciones locales que ayudan con papeles de beneficios.\n- En Costa, abra Ayuda para ver opciones cercanas, o Preguntar para pedir que alguien le contacte.\n\nSolo el condado decide quién califica. Quienes ayudan pueden guiarle; no aprueban su caso.",
      zh: "您可以免费获得申请协助，不必独自搞定一切。\n- 致电县政府：San Mateo 1-800-223-8383，Santa Clara 1-877-962-3633。\n- 拨打 211 找帮助办理福利表格的本地社区组织。\n- 在 Costa 打开“帮助”查看附近选项，或在“提问”请求人工跟进。\n\n只有县政府决定谁合资格。协助人员可以指导您，但不能批准您的个案。",
      tl: "Puwede kang makakuha ng libreng tulong sa pag-a-apply nang hindi mo kailangang gawin mag-isa.\n- Tawagan ang county: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- I-dial ang 211 para sa lokal na organisasyon na tumutulong sa papeles ng benepisyo.\n- Sa Costa, buksan ang Help para sa malapit na opsyon, o Ask para humingi ng follow-up ng tao.\n\nAng county lang ang nagpapasya kung sino ang pasok. Ang mga helper ay gabay lang; hindi nila inaaprubahan ang kaso.",
      vi: "Bạn có thể được giúp nộp đơn miễn phí mà không phải tự làm hết.\n- Gọi quận: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- Gọi 211 để tìm tổ chức địa phương hỗ trợ giấy tờ phúc lợi.\n- Trên Costa, mở Trợ giúp để xem lựa chọn gần bạn, hoặc Hỏi để nhờ người liên hệ lại.\n\nChỉ quận quyết định ai đủ điều kiện. Người hỗ trợ chỉ hướng dẫn; không phê duyệt hồ sơ.",
      ko: "혼자 처리하지 않고 무료로 신청 도움을 받을 수 있습니다.\n- 카운티 전화: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- 복리 서류 도움을 주는 지역 단체는 211.\n- Costa에서 Help로 근처 옵션을 보거나 Ask에서 사람 연락을 요청하세요.\n\n자격은 카운티만 결정합니다. 도우미는 안내만 하며 승인하지 않습니다.",
      pt: "Pode ter ajuda gratuita para pedir sem fazer tudo sozinho.\n- Ligue ao condado: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- Marque 211 para organizações locais que ajudam com papéis de benefícios.\n- Na Costa, abra Ajuda para opções perto de si, ou Perguntar para pedir contacto de uma pessoa.\n\nSó o condado decide quem se qualifica. Quem ajuda orienta; não aprova o seu caso.",
    },
  },
];

export const FAQS: Faq[] = [...CORE_FAQS, ...DISASTER_FAQS, ...EXTRA_FAQS];

export function faqsForTopic(topic: TopicId): Faq[] {
  return FAQS.filter((f) => f.topic === topic);
}

export function faqQuestion(faq: Faq, language: LanguageCode): string {
  return faq.question[language] ?? faq.question.en;
}

export function faqAnswer(faq: Faq, language: LanguageCode): string {
  return faq.answer[language] ?? faq.answer.en;
}

function fold(text: string): string {
  return text.normalize("NFKC").toLowerCase();
}

function compact(text: string): string {
  return fold(text).replace(/[\p{P}\p{S}\s]+/gu, "");
}

function tokens(text: string): Set<string> {
  const parts = fold(text)
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
  return new Set(parts);
}

function charGrams(text: string, n = 2): Set<string> {
  const s = compact(text);
  const out = new Set<string>();
  if (s.length < n) {
    if (s) out.add(s);
    return out;
  }
  for (let i = 0; i <= s.length - n; i++) out.add(s.slice(i, i + n));
  return out;
}

function overlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  // Coverage of the shorter set — paraphrases that add words still match.
  return inter / Math.min(a.size, b.size);
}

type Candidate = { faq: Faq; language: LanguageCode; phrase: string };

function candidates(): Candidate[] {
  const out: Candidate[] = [];
  for (const faq of FAQS) {
    for (const [language, phrase] of Object.entries(faq.question) as [LanguageCode, string][]) {
      if (phrase) out.push({ faq, language, phrase });
    }
    for (const phrase of faq.aliases ?? []) {
      out.push({ faq, language: "en", phrase });
    }
  }
  return out;
}

const ALL = candidates();
const byExact = new Map<string, Candidate>();
for (const c of ALL) byExact.set(compact(c.phrase), c);

/**
 * Map free text to the nearest FAQ question.
 * Exact match first, then fuzzy token / character-gram coverage.
 */
export function matchFaq(
  text: string,
  opts?: { preferredLang?: LanguageCode; minScore?: number },
): { faq: Faq; language: LanguageCode; score: number; matchedQuestion: string } | null {
  const raw = text.trim();
  if (!raw) return null;
  const minScore = opts?.minScore ?? 0.62;
  const exact = byExact.get(compact(raw));
  if (exact) {
    return { faq: exact.faq, language: exact.language, score: 1, matchedQuestion: exact.phrase };
  }

  const qTokens = tokens(raw);
  const qGrams = charGrams(raw);
  let best: Candidate | null = null;
  let bestScore = 0;

  for (const c of ALL) {
    const tokenScore = overlap(qTokens, tokens(c.phrase));
    const gramScore = overlap(qGrams, charGrams(c.phrase));
    let score = Math.max(tokenScore, gramScore);
    if (opts?.preferredLang && c.language === opts.preferredLang) score += 0.03;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  if (!best || bestScore < minScore) return null;
  return {
    faq: best.faq,
    language: best.language,
    score: bestScore,
    matchedQuestion: best.phrase,
  };
}

/** Nearest canonical question string for the UI language (for confirming intent). */
export function nearestFaqQuestion(text: string, language: LanguageCode): string | null {
  const hit = matchFaq(text, { preferredLang: language });
  if (!hit) return null;
  return faqQuestion(hit.faq, language);
}

export function faqQuestions(language: LanguageCode): string[] {
  return FAQS.map((f) => faqQuestion(f, language));
}

export function faqSources(faq: Faq) {
  return faq.sourceIds.map((id) => {
    const s = getSource(id);
    if (!s) throw new Error(`FAQ ${faq.id} cites unknown source ${id}`);
    return { sourceId: s.id, title: s.title, agency: s.agency, url: s.url, lastVerified: s.lastVerified };
  });
}
