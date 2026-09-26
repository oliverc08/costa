import { getSource } from "@/lib/knowledge";
import type { LanguageCode } from "@/lib/languages";

/**
 * Pre-written answers to the most common questions, served without calling the model.
 * Every fact and phone number must come from the listed sources in content/sources;
 * tests/faq.test.ts enforces sources, phone numbers, and the output safety audit.
 * Translations should be reviewed by native speakers before any wording change ships.
 */
export interface Faq {
  id: string;
  sourceIds: string[];
  question: Record<LanguageCode, string>;
  answer: Record<LanguageCode, string>;
}

export const FAQS: Faq[] = [
  {
    id: "renew-medi-cal",
    sourceIds: ["medi-cal-renewal", "medi-cal-apply"],
    question: {
      en: "How do I renew my Medi-Cal?",
      es: "¿Cómo renuevo mi Medi-Cal?",
      zh: "我怎么续保 Medi-Cal？",
      tl: "Paano ko ire-renew ang Medi-Cal ko?",
      vi: "Làm sao để gia hạn Medi-Cal?",
    },
    answer: {
      en: "Medi-Cal checks every year that you still qualify. First, the county tries to renew you automatically. If it can, you get a notice and don't need to do anything.\n\nIf you get a renewal form in a yellow envelope:\n1. Check the pre-filled information and fix anything that is wrong.\n2. Send the proof it asks for, like pay stubs.\n3. Sign it and return it by the due date: online at BenefitsCal.com, by mail, by phone, or in person.\n\nIf you don't return it, your Medi-Cal will end. County phone: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.",
      es: "Medi-Cal revisa cada año si todavía califica. Primero, el condado intenta renovarle automáticamente. Si puede, le llega un aviso y no tiene que hacer nada.\n\nSi le llega un formulario de renovación en un sobre amarillo:\n1. Revise la información que ya viene escrita y corrija lo que esté mal.\n2. Envíe las pruebas que pide, como talones de pago.\n3. Fírmelo y entréguelo antes de la fecha límite: en línea en BenefitsCal.com, por correo, por teléfono o en persona.\n\nSi no lo entrega, su Medi-Cal se termina. Teléfono del condado: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.",
      zh: "Medi-Cal 每年都会审核您是否仍然合资格。县政府会先尝试自动为您续保。如果可以，您会收到通知，不需要做任何事。\n\n如果您收到黄色信封里的续保表格：\n1. 检查表格上已填好的信息，改正错误的地方。\n2. 寄送表格要求的证明，例如工资单。\n3. 签名，并在截止日期前交回：可以在 BenefitsCal.com 网上提交、邮寄、打电话或亲自去办。\n\n如果不交回表格，您的 Medi-Cal 会被终止。县政府电话：San Mateo 1-800-223-8383，Santa Clara 1-877-962-3633。",
      tl: "Tinitingnan ng Medi-Cal bawat taon kung pasok ka pa. Una, susubukan ng county na i-renew ka nang awtomatiko. Kung kaya nila, makakatanggap ka ng notice at wala ka nang kailangang gawin.\n\nKung may dumating na renewal form sa dilaw na sobre:\n1. Tingnan ang impormasyong nakasulat na at itama ang mali.\n2. Ipadala ang patunay na hinihingi, tulad ng pay stub.\n3. Pirmahan at ibalik bago ang deadline: online sa BenefitsCal.com, sa koreo, sa telepono, o nang personal.\n\nKung hindi mo ito ibabalik, matitigil ang Medi-Cal mo. Telepono ng county: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.",
      vi: "Mỗi năm Medi-Cal kiểm tra xem bạn có còn đủ điều kiện không. Trước tiên, quận sẽ cố gắng tự động gia hạn cho bạn. Nếu được, bạn sẽ nhận thư báo và không cần làm gì cả.\n\nNếu bạn nhận được mẫu gia hạn trong phong bì màu vàng:\n1. Kiểm tra thông tin đã điền sẵn và sửa chỗ sai.\n2. Gửi giấy tờ chứng minh được yêu cầu, như cuống lương.\n3. Ký tên và gửi lại trước hạn chót: trên mạng tại BenefitsCal.com, qua bưu điện, qua điện thoại hoặc đến tận nơi.\n\nNếu không gửi lại, Medi-Cal của bạn sẽ bị chấm dứt. Điện thoại của quận: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.",
    },
  },
  {
    id: "medi-cal-ended",
    sourceIds: ["medi-cal-lost-coverage"],
    question: {
      en: "My Medi-Cal was cut off. What do I do?",
      es: "Me cortaron el Medi-Cal. ¿Qué hago?",
      zh: "我的 Medi-Cal 被停了，怎么办？",
      tl: "Natigil ang Medi-Cal ko. Ano ang gagawin ko?",
      vi: "Medi-Cal của tôi bị cắt. Tôi phải làm gì?",
    },
    answer: {
      en: "If your Medi-Cal ended because of missing paperwork, you have 90 days from the end date to fix it.\n1. Send your county the signed renewal form and ALL the missing documents.\n2. You don't need a new application.\n3. If the county finds you still qualify, your coverage goes back to the date it ended.\n\nAfter 90 days, you must apply again. If you disagree with the decision, you have 90 days from the date on the notice to ask for a State Hearing: (800) 743-8525. Free help with Medi-Cal problems: Health Consumer Alliance, 1-888-804-3536.",
      es: "Si su Medi-Cal terminó por papeles que faltaban, tiene 90 días desde la fecha en que terminó para arreglarlo.\n1. Envíe al condado el formulario de renovación firmado y TODOS los documentos que faltan.\n2. No necesita una solicitud nueva.\n3. Si el condado ve que todavía califica, su cobertura regresa hasta la fecha en que terminó.\n\nDespués de 90 días, tiene que solicitar otra vez. Si no está de acuerdo con la decisión, tiene 90 días desde la fecha del aviso para pedir una Audiencia Estatal: (800) 743-8525. Ayuda gratis con problemas de Medi-Cal: Health Consumer Alliance, 1-888-804-3536.",
      zh: "如果您的 Medi-Cal 是因为缺少文件而被终止，您从终止日期起有 90 天时间补救。\n1. 把签好名的续保表格和所有缺少的文件寄给县政府。\n2. 不需要重新申请。\n3. 如果县政府确认您仍然合资格，您的保险会恢复到终止的那一天，中间不会断保。\n\n超过 90 天，就必须重新申请。如果您不同意这个决定，可以在通知日期起 90 天内要求州听证会：(800) 743-8525。Medi-Cal 问题免费帮助：Health Consumer Alliance，1-888-804-3536。",
      tl: "Kung natigil ang Medi-Cal mo dahil may kulang na papeles, may 90 araw ka mula sa petsa ng pagtigil para ayusin ito.\n1. Ipadala sa county ang pinirmahang renewal form at LAHAT ng kulang na dokumento.\n2. Hindi mo kailangan ng bagong aplikasyon.\n3. Kung makita ng county na pasok ka pa, ibabalik ang coverage mo hanggang sa petsa na tumigil ito.\n\nPagkalipas ng 90 araw, kailangan mong mag-apply ulit. Kung hindi ka sang-ayon sa desisyon, may 90 araw ka mula sa petsa ng notice para humingi ng State Hearing: (800) 743-8525. Libreng tulong sa problema sa Medi-Cal: Health Consumer Alliance, 1-888-804-3536.",
      vi: "Nếu Medi-Cal của bạn bị chấm dứt vì thiếu giấy tờ, bạn có 90 ngày kể từ ngày chấm dứt để sửa lại.\n1. Gửi cho quận mẫu gia hạn đã ký và TẤT CẢ giấy tờ còn thiếu.\n2. Bạn không cần nộp đơn mới.\n3. Nếu quận xác định bạn vẫn còn đủ điều kiện, bảo hiểm sẽ được khôi phục từ ngày bị chấm dứt.\n\nSau 90 ngày, bạn phải nộp đơn lại. Nếu không đồng ý với quyết định, bạn có 90 ngày kể từ ngày ghi trên thư báo để xin Phiên Điều Trần Tiểu Bang: (800) 743-8525. Trợ giúp miễn phí về Medi-Cal: Health Consumer Alliance, 1-888-804-3536.",
    },
  },
  {
    id: "apply-medi-cal",
    sourceIds: ["medi-cal-apply"],
    question: {
      en: "How do I apply for Medi-Cal?",
      es: "¿Cómo solicito Medi-Cal?",
      zh: "我怎么申请 Medi-Cal？",
      tl: "Paano mag-apply sa Medi-Cal?",
      vi: "Làm sao để đăng ký Medi-Cal?",
    },
    answer: {
      en: "You can apply for Medi-Cal at any time of year. There is no deadline.\n- Online: BenefitsCal.com\n- By phone: San Mateo County 1-800-223-8383, Santa Clara County 1-877-962-3633\n- In person at your county human services office\n\nChildren under 19 and pregnant people can get full Medi-Cal no matter their immigration status, if they meet the income rules. Only the county can decide who qualifies. If it needs more information, it will send you a letter.",
      es: "Puede solicitar Medi-Cal en cualquier momento del año. No hay fecha límite.\n- En línea: BenefitsCal.com\n- Por teléfono: condado de San Mateo 1-800-223-8383, condado de Santa Clara 1-877-962-3633\n- En persona en la oficina de servicios humanos de su condado\n\nLos niños menores de 19 años y las personas embarazadas pueden recibir Medi-Cal completo sin importar su estatus migratorio, si cumplen las reglas de ingresos. Solo el condado puede decidir quién califica. Si necesita más información, le enviará una carta.",
      zh: "一年中任何时候都可以申请 Medi-Cal，没有截止日期。\n- 网上申请：BenefitsCal.com\n- 电话申请：San Mateo 县 1-800-223-8383，Santa Clara 县 1-877-962-3633\n- 亲自去您所在县的公众服务办公室\n\n19 岁以下的儿童和怀孕的人，只要符合收入规定，不论移民身份都可以获得全面的 Medi-Cal。只有县政府可以决定谁合资格。如果需要更多资料，县政府会寄信给您。",
      tl: "Puwede kang mag-apply sa Medi-Cal kahit anong oras ng taon. Walang deadline.\n- Online: BenefitsCal.com\n- Sa telepono: San Mateo County 1-800-223-8383, Santa Clara County 1-877-962-3633\n- Nang personal sa human services office ng county mo\n\nAng mga batang wala pang 19 taong gulang at mga buntis ay puwedeng makakuha ng buong Medi-Cal anuman ang immigration status, kung pasok sila sa income rules. Ang county lang ang puwedeng magpasya kung sino ang pasok. Kung kailangan nila ng dagdag na impormasyon, padadalhan ka nila ng sulat.",
      vi: "Bạn có thể đăng ký Medi-Cal bất cứ lúc nào trong năm. Không có hạn chót.\n- Trên mạng: BenefitsCal.com\n- Qua điện thoại: Quận San Mateo 1-800-223-8383, Quận Santa Clara 1-877-962-3633\n- Đến tận nơi văn phòng dịch vụ xã hội của quận\n\nTrẻ em dưới 19 tuổi và người đang mang thai có thể nhận Medi-Cal đầy đủ bất kể tình trạng di trú, nếu đáp ứng quy định về thu nhập. Chỉ có quận mới quyết định ai đủ điều kiện. Nếu cần thêm thông tin, quận sẽ gửi thư cho bạn.",
    },
  },
  {
    id: "food-help",
    sourceIds: ["calfresh", "wic"],
    question: {
      en: "Can my family get food help?",
      es: "¿Mi familia puede recibir ayuda para comida?",
      zh: "我家可以申请食物补助吗？",
      tl: "Puwede bang makakuha ng tulong sa pagkain ang pamilya ko?",
      vi: "Gia đình tôi có thể nhận trợ giúp thực phẩm không?",
    },
    answer: {
      en: "CalFresh gives monthly money for food on an EBT card. You can use it at most grocery stores and farmers markets.\n- Apply online at BenefitsCal.com or call 1-877-847-3663.\n- The county will do an interview, usually by phone, and ask for proof of income.\n- The county decides who qualifies and how much each household gets.\n\nIf someone in your home is pregnant or you care for a child under 5, also ask about WIC: 1-800-852-5770. WIC does not require a Social Security number or proof of citizenship.",
      es: "CalFresh da dinero cada mes para comida en una tarjeta EBT. Se puede usar en la mayoría de los supermercados y mercados de agricultores.\n- Solicite en línea en BenefitsCal.com o llame al 1-877-847-3663.\n- El condado le hará una entrevista, casi siempre por teléfono, y le pedirá prueba de ingresos.\n- El condado decide si califica y cuánto recibe.\n\nSi alguien en su casa está embarazada o cuida a un niño menor de 5 años, pregunte también por WIC: 1-800-852-5770. WIC no pide número de Seguro Social ni prueba de ciudadanía.",
      zh: "CalFresh 每月把买食物的钱存入 EBT 卡。大多数超市和农夫市场都可以使用。\n- 在 BenefitsCal.com 网上申请，或拨打 1-877-847-3663。\n- 县政府会进行面谈（通常用电话），并要求收入证明。\n- 由县政府决定您是否合资格以及可以领多少。\n\n如果家里有人怀孕，或您照顾 5 岁以下的孩子，也可以问问 WIC：1-800-852-5770。WIC 不要求社会安全号码或公民身份证明。",
      tl: "Ang CalFresh ay nagbibigay ng buwanang pera para sa pagkain sa isang EBT card. Puwede itong gamitin sa karamihan ng grocery at farmers market.\n- Mag-apply online sa BenefitsCal.com o tumawag sa 1-877-847-3663.\n- Mag-iinterview ang county, kadalasan sa telepono, at hihingi ng patunay ng kita.\n- Ang county ang magpapasya kung pasok ka at kung magkano ang matatanggap mo.\n\nKung may buntis sa bahay o may inaalagaan kang batang wala pang 5 taon, magtanong din tungkol sa WIC: 1-800-852-5770. Hindi humihingi ang WIC ng Social Security number o patunay ng citizenship.",
      vi: "CalFresh cấp tiền mua thực phẩm hằng tháng vào thẻ EBT. Bạn có thể dùng thẻ ở hầu hết các cửa hàng tạp hóa và chợ nông sản.\n- Đăng ký trên mạng tại BenefitsCal.com hoặc gọi 1-877-847-3663.\n- Quận sẽ phỏng vấn, thường là qua điện thoại, và yêu cầu giấy tờ chứng minh thu nhập.\n- Quận quyết định bạn có đủ điều kiện không và nhận được bao nhiêu.\n\nNếu trong nhà có người đang mang thai hoặc bạn chăm sóc trẻ dưới 5 tuổi, hãy hỏi thêm về WIC: 1-800-852-5770. WIC không yêu cầu số An Sinh Xã Hội hay giấy tờ chứng minh quốc tịch.",
    },
  },
  {
    id: "wic",
    sourceIds: ["wic"],
    question: {
      en: "I'm pregnant or have a baby. Can I get WIC?",
      es: "Estoy embarazada o tengo un bebé. ¿Puedo recibir WIC?",
      zh: "我怀孕了或有小宝宝，可以申请 WIC 吗？",
      tl: "Buntis ako o may baby. Puwede ba akong mag-WIC?",
      vi: "Tôi đang mang thai hoặc có con nhỏ. Tôi có thể nhận WIC không?",
    },
    answer: {
      en: "WIC gives healthy food, nutrition help, and breastfeeding support. It is for people who are pregnant, breastfeeding, or had a baby in the last 6 months, and for children under 5.\n- If you already get Medi-Cal, CalFresh, or CalWORKs, you automatically meet the WIC income rule.\n- WIC does not require a Social Security number or proof of citizenship.\n- Call California WIC at 1-800-852-5770 to make an appointment. Only WIC staff can officially confirm eligibility.",
      es: "WIC da comida saludable, ayuda con la nutrición y apoyo para amamantar. Es para personas embarazadas, que están amamantando o que tuvieron un bebé en los últimos 6 meses, y para niños menores de 5 años.\n- Si ya recibe Medi-Cal, CalFresh o CalWORKs, cumple automáticamente la regla de ingresos de WIC.\n- WIC no pide número de Seguro Social ni prueba de ciudadanía.\n- Llame a WIC de California al 1-800-852-5770 para hacer una cita. Solo el personal de WIC puede confirmar si califica.",
      zh: "WIC 提供健康食物、营养指导和母乳喂养支持。适用于怀孕、正在哺乳或过去 6 个月内生过孩子的人，以及 5 岁以下的儿童。\n- 如果您已经有 Medi-Cal、CalFresh 或 CalWORKs，就自动符合 WIC 的收入规定。\n- WIC 不要求社会安全号码或公民身份证明。\n- 请拨打加州 WIC 1-800-852-5770 预约。只有 WIC 工作人员可以确认您是否合资格。",
      tl: "Nagbibigay ang WIC ng masustansyang pagkain, tulong sa nutrisyon, at suporta sa pagpapasuso. Para ito sa mga buntis, nagpapasuso, o nanganak sa loob ng huling 6 na buwan, at sa mga batang wala pang 5 taon.\n- Kung may Medi-Cal, CalFresh, o CalWORKs ka na, awtomatiko kang pasok sa income rule ng WIC.\n- Hindi humihingi ang WIC ng Social Security number o patunay ng citizenship.\n- Tumawag sa California WIC sa 1-800-852-5770 para magpa-appointment. Ang WIC staff lang ang makakapagkumpirma kung pasok ka.",
      vi: "WIC cung cấp thực phẩm lành mạnh, hướng dẫn dinh dưỡng và hỗ trợ cho con bú. Chương trình dành cho người đang mang thai, đang cho con bú hoặc mới sinh con trong 6 tháng qua, và trẻ em dưới 5 tuổi.\n- Nếu bạn đã có Medi-Cal, CalFresh hoặc CalWORKs, bạn tự động đáp ứng quy định thu nhập của WIC.\n- WIC không yêu cầu số An Sinh Xã Hội hay giấy tờ chứng minh quốc tịch.\n- Gọi WIC California số 1-800-852-5770 để lấy hẹn. Chỉ nhân viên WIC mới xác nhận được bạn có đủ điều kiện hay không.",
    },
  },
  {
    id: "report-change",
    sourceIds: ["medi-cal-changes", "medi-cal-apply"],
    question: {
      en: "I moved or my income changed. What do I do?",
      es: "Me mudé o cambiaron mis ingresos. ¿Qué hago?",
      zh: "我搬家了或收入变了，该怎么办？",
      tl: "Lumipat ako o nagbago ang kita ko. Ano ang gagawin ko?",
      vi: "Tôi đã chuyển nhà hoặc thu nhập thay đổi. Tôi phải làm gì?",
    },
    answer: {
      en: "Tell your county within 10 days when you move, change your mailing address, or your income or job changes.\n- Report online at BenefitsCal.com or call your county: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- If you move to another county in California, your Medi-Cal can move with you. You will choose a new health plan in the new county.\n\nThe county mails renewal forms to your address, so keeping it up to date helps you keep Medi-Cal.",
      es: "Avise a su condado dentro de 10 días si se muda, cambia su dirección de correo, o cambian sus ingresos o su trabajo.\n- Repórtelo en línea en BenefitsCal.com o llame a su condado: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- Si se muda a otro condado de California, su Medi-Cal se puede mudar con usted. Va a elegir un plan de salud nuevo en el nuevo condado.\n\nEl condado envía los formularios de renovación a su dirección, así que tenerla al día le ayuda a mantener su Medi-Cal.",
      zh: "如果您搬家、更改邮寄地址，或收入、工作有变化，请在 10 天内通知县政府。\n- 在 BenefitsCal.com 网上报告，或打电话给县政府：San Mateo 1-800-223-8383，Santa Clara 1-877-962-3633。\n- 如果搬到加州的另一个县，您的 Medi-Cal 可以跟着转过去。您需要在新的县选择新的健康计划。\n\n县政府会把续保表格寄到您的地址，所以及时更新地址可以帮助您保住 Medi-Cal。",
      tl: "Sabihan ang county mo sa loob ng 10 araw kapag lumipat ka, nagpalit ng mailing address, o nagbago ang kita o trabaho mo.\n- I-report online sa BenefitsCal.com o tawagan ang county mo: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- Kung lilipat ka sa ibang county sa California, puwedeng sumama ang Medi-Cal mo. Pipili ka ng bagong health plan sa bagong county.\n\nSa address mo ipinapadala ng county ang mga renewal form, kaya ang pag-update nito ay tumutulong para hindi mawala ang Medi-Cal mo.",
      vi: "Hãy báo cho quận trong vòng 10 ngày khi bạn chuyển nhà, đổi địa chỉ nhận thư, hoặc thu nhập hay công việc thay đổi.\n- Báo trên mạng tại BenefitsCal.com hoặc gọi cho quận: San Mateo 1-800-223-8383, Santa Clara 1-877-962-3633.\n- Nếu bạn chuyển đến quận khác trong California, Medi-Cal có thể chuyển theo bạn. Bạn sẽ chọn chương trình bảo hiểm mới ở quận mới.\n\nQuận gửi mẫu gia hạn đến địa chỉ của bạn, nên cập nhật địa chỉ giúp bạn giữ được Medi-Cal.",
    },
  },
  {
    id: "tax-credits-itin",
    sourceIds: ["caleitc-itin"],
    question: {
      en: "Can I get tax credits with an ITIN?",
      es: "¿Puedo recibir créditos de impuestos con un ITIN?",
      zh: "用 ITIN 可以申请税收抵免吗？",
      tl: "Puwede ba akong makakuha ng tax credit gamit ang ITIN?",
      vi: "Tôi có thể nhận tín thuế bằng số ITIN không?",
    },
    answer: {
      en: "In California, you can use an ITIN to claim the California Earned Income Tax Credit (CalEITC) and the Young Child Tax Credit. You must file a California tax return (Form 540 with Form FTB 3514). You can get money back even if you owe no tax.\n- For tax year 2025, CalEITC is for people with earned income up to $32,900.\n- The federal EITC requires a Social Security number, so it is not available with an ITIN.\n- Free tax help: VITA sites, 1-800-906-9887 or irs.gov/vita.",
      es: "En California, puede usar un ITIN para pedir el Crédito Tributario por Ingreso del Trabajo de California (CalEITC) y el Crédito Tributario por Hijos Pequeños. Tiene que presentar una declaración de impuestos de California (Formulario 540 con el Formulario FTB 3514). Puede recibir dinero aunque no deba impuestos.\n- Para el año tributario 2025, CalEITC es para personas con ingresos de trabajo de hasta $32,900.\n- El EITC federal pide número de Seguro Social, así que no se puede pedir con un ITIN.\n- Ayuda gratis con impuestos: sitios VITA, 1-800-906-9887 o irs.gov/vita.",
      zh: "在加州，您可以用 ITIN 申请加州劳动所得税抵免（CalEITC）和幼儿税收抵免。您必须提交加州税表（Form 540 和 Form FTB 3514）。即使不欠税，也可能拿到退款。\n- 2025 税务年度，CalEITC 适用于工作收入不超过 $32,900 的人。\n- 联邦 EITC 需要社会安全号码，所以用 ITIN 不能申请。\n- 免费报税帮助：VITA 服务点，1-800-906-9887 或 irs.gov/vita。",
      tl: "Sa California, puwede mong gamitin ang ITIN para i-claim ang California Earned Income Tax Credit (CalEITC) at Young Child Tax Credit. Kailangan mong mag-file ng California tax return (Form 540 kasama ang Form FTB 3514). Puwede kang makakuha ng pera kahit wala kang utang na tax.\n- Para sa tax year 2025, ang CalEITC ay para sa may kinita sa trabaho na hanggang $32,900.\n- Kailangan ng Social Security number ang federal EITC, kaya hindi ito makukuha gamit ang ITIN.\n- Libreng tulong sa tax: mga VITA site, 1-800-906-9887 o irs.gov/vita.",
      vi: "Ở California, bạn có thể dùng số ITIN để xin Tín Thuế Thu Nhập California (CalEITC) và Tín Thuế Trẻ Nhỏ. Bạn phải nộp tờ khai thuế California (Mẫu 540 kèm Mẫu FTB 3514). Bạn có thể nhận tiền về dù không nợ thuế.\n- Cho năm thuế 2025, CalEITC dành cho người có thu nhập từ việc làm tối đa $32,900.\n- Tín thuế EITC liên bang cần số An Sinh Xã Hội, nên không thể xin bằng ITIN.\n- Trợ giúp khai thuế miễn phí: các điểm VITA, 1-800-906-9887 hoặc irs.gov/vita.",
    },
  },
  {
    id: "confusing-letter",
    sourceIds: ["medi-cal-notices"],
    question: {
      en: "I got a letter I don't understand.",
      es: "Recibí una carta que no entiendo.",
      zh: "我收到一封看不懂的信。",
      tl: "May natanggap akong sulat na hindi ko maintindihan.",
      vi: "Tôi nhận được một lá thư mà tôi không hiểu.",
    },
    answer: {
      en: "Look for three things on the letter: the date it was mailed, the due date, and what it asks you to send or do. Do it before the due date.\n- A yellow envelope is usually a Medi-Cal renewal form.\n- A Notice of Action tells you about a decision. If you disagree, you have 90 days from the date on the notice to ask for a State Hearing: (800) 743-8525.\n\nYou can also take a photo of the letter with the button below this chat, and Costa will explain it in your language.",
      es: "Busque tres cosas en la carta: la fecha en que se envió, la fecha límite y lo que le pide enviar o hacer. Hágalo antes de la fecha límite.\n- Un sobre amarillo casi siempre es un formulario de renovación de Medi-Cal.\n- Un Aviso de Acción le informa sobre una decisión. Si no está de acuerdo, tiene 90 días desde la fecha del aviso para pedir una Audiencia Estatal: (800) 743-8525.\n\nTambién puede tomarle una foto a la carta con el botón debajo de este chat, y Costa se la explica en su idioma.",
      zh: "请在信上找三样东西：寄出日期、截止日期，以及信上要求您寄送或做什么。请在截止日期前办好。\n- 黄色信封通常是 Medi-Cal 续保表格。\n- 行动通知（Notice of Action）是告诉您一个决定。如果您不同意，可以在通知日期起 90 天内要求州听证会：(800) 743-8525。\n\n您也可以用这个聊天框下面的按钮给信拍照，Costa 会用您的语言解释。",
      tl: "Hanapin ang tatlong bagay sa sulat: ang petsa na ipinadala ito, ang deadline, at kung ano ang hinihingi nitong ipadala o gawin. Gawin ito bago ang deadline.\n- Ang dilaw na sobre ay kadalasang renewal form ng Medi-Cal.\n- Ang Notice of Action ay nagsasabi tungkol sa isang desisyon. Kung hindi ka sang-ayon, may 90 araw ka mula sa petsa ng notice para humingi ng State Hearing: (800) 743-8525.\n\nPuwede mo ring kunan ng litrato ang sulat gamit ang button sa ilalim ng chat na ito, at ipapaliwanag ito ni Costa sa iyong wika.",
      vi: "Hãy tìm ba điều trên thư: ngày gửi thư, hạn chót, và thư yêu cầu bạn gửi hay làm gì. Hãy làm trước hạn chót.\n- Phong bì màu vàng thường là mẫu gia hạn Medi-Cal.\n- Thông Báo Hành Động (Notice of Action) cho bạn biết về một quyết định. Nếu không đồng ý, bạn có 90 ngày kể từ ngày ghi trên thư báo để xin Phiên Điều Trần Tiểu Bang: (800) 743-8525.\n\nBạn cũng có thể chụp ảnh lá thư bằng nút bên dưới khung trò chuyện này, và Costa sẽ giải thích bằng ngôn ngữ của bạn.",
    },
  },
];

function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\p{P}\p{S}\s]+/gu, "");
}

const byQuestion = new Map<string, { faq: Faq; language: LanguageCode }>();
for (const faq of FAQS) {
  for (const [language, q] of Object.entries(faq.question) as [LanguageCode, string][]) {
    byQuestion.set(normalize(q), { faq, language });
  }
}

/** Exact (punctuation- and case-insensitive) match against any language's question. */
export function matchFaq(text: string): { faq: Faq; language: LanguageCode } | null {
  return byQuestion.get(normalize(text)) ?? null;
}

export function faqQuestions(language: LanguageCode): string[] {
  return FAQS.map((f) => f.question[language]);
}

export function faqSources(faq: Faq) {
  return faq.sourceIds.map((id) => {
    const s = getSource(id);
    if (!s) throw new Error(`FAQ ${faq.id} cites unknown source ${id}`);
    return { sourceId: s.id, title: s.title, agency: s.agency, url: s.url, lastVerified: s.lastVerified };
  });
}
