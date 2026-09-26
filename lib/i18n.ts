import type { LanguageCode } from "@/lib/languages";

export interface UiStrings {
  tagline: string;
  subtitle: string;
  call: string;
  text: string;
  ask: string;
  askPlaceholder: string;
  send: string;
  thinking: string;
  letterCta: string;
  letterTitle: string;
  letterIntro: string;
  letterChoose: string;
  letterAnalyze: string;
  letterAnalyzing: string;
  whatThisMeans: string;
  whatToDo: string;
  deadline: string;
  needHelp: string;
  needHelpBody: string;
  requestHelp: string;
  phoneLabel: string;
  consentLabel: string;
  requestSent: string;
  sources: string;
  privacyNote: string;
  redactedWarning: string;
  safetyTitle: string;
  safetyItems: string[];
  suggestions: string[];
  notConfigured: string;
}

export const UI: Record<LanguageCode, UiStrings> = {
  en: {
    tagline: "Benefits help in your language.",
    subtitle: "Call. Text. Ask. Free help with Medi-Cal, CalFresh, WIC, tax credits, and disaster aid. No account. No app.",
    call: "Call Costa",
    text: "Text Costa",
    ask: "Ask Costa",
    askPlaceholder: "Ask in any language…",
    send: "Send",
    thinking: "Costa is checking official sources…",
    letterCta: "Got a confusing letter? Take a photo",
    letterTitle: "Understand a benefits letter",
    letterIntro: "Take a photo of a Medi-Cal, CalFresh, or other benefits letter. Costa explains it in your language. The photo is not saved.",
    letterChoose: "Take or choose a photo",
    letterAnalyze: "Explain this letter",
    letterAnalyzing: "Reading your letter…",
    whatThisMeans: "What this means",
    whatToDo: "What you need to do",
    deadline: "Deadline",
    needHelp: "Need help?",
    needHelpBody: "A local helper can call or text you back.",
    requestHelp: "Ask a person to help me",
    phoneLabel: "Your phone number",
    consentLabel: "I agree to share this request with a local benefits helper.",
    requestSent: "Request sent. Your reference number is",
    sources: "Verified sources",
    privacyNote: "Never share your Social Security number, ITIN, or Medi-Cal ID number.",
    redactedWarning: "We removed a private number from your message before sending it.",
    safetyTitle: "How Costa stays safe",
    safetyItems: [
      "Answers come only from official government sources, with a link to each one.",
      "Costa never decides if you qualify. Only the agency can.",
      "Private numbers like SSNs are removed before anything is sent or saved.",
      "Costa never asks about immigration status.",
      "You can ask for a real person at any time.",
      "Messages are deleted after 30 days.",
    ],
    suggestions: [
      "How do I renew my Medi-Cal?",
      "My Medi-Cal was cut off. What do I do?",
      "Can my family get food help?",
    ],
    notConfigured: "Costa's AI is not configured on this server yet.",
  },
  es: {
    tagline: "Ayuda con beneficios en su idioma.",
    subtitle: "Llame. Envíe un texto. Pregunte. Ayuda gratis con Medi-Cal, CalFresh, WIC, créditos de impuestos y ayuda por desastres. Sin cuenta. Sin app.",
    call: "Llamar a Costa",
    text: "Enviar texto a Costa",
    ask: "Pregúntele a Costa",
    askPlaceholder: "Pregunte en cualquier idioma…",
    send: "Enviar",
    thinking: "Costa está revisando fuentes oficiales…",
    letterCta: "¿Recibió una carta confusa? Tómele una foto",
    letterTitle: "Entienda una carta de beneficios",
    letterIntro: "Tome una foto de una carta de Medi-Cal, CalFresh u otro beneficio. Costa se la explica en su idioma. La foto no se guarda.",
    letterChoose: "Tomar o elegir una foto",
    letterAnalyze: "Explicar esta carta",
    letterAnalyzing: "Leyendo su carta…",
    whatThisMeans: "Qué significa",
    whatToDo: "Lo que tiene que hacer",
    deadline: "Fecha límite",
    needHelp: "¿Necesita ayuda?",
    needHelpBody: "Una persona de ayuda local le puede llamar o enviar un texto.",
    requestHelp: "Pedir que una persona me ayude",
    phoneLabel: "Su número de teléfono",
    consentLabel: "Acepto compartir esta solicitud con una persona de ayuda local.",
    requestSent: "Solicitud enviada. Su número de referencia es",
    sources: "Fuentes verificadas",
    privacyNote: "Nunca comparta su número de Seguro Social, ITIN o número de Medi-Cal.",
    redactedWarning: "Quitamos un número privado de su mensaje antes de enviarlo.",
    safetyTitle: "Cómo Costa le protege",
    safetyItems: [
      "Las respuestas vienen solo de fuentes oficiales del gobierno, con un enlace a cada una.",
      "Costa nunca decide si usted califica. Solo la agencia puede decidir.",
      "Los números privados, como el Seguro Social, se quitan antes de enviar o guardar algo.",
      "Costa nunca pregunta sobre su estatus migratorio.",
      "Puede pedir hablar con una persona en cualquier momento.",
      "Los mensajes se borran después de 30 días.",
    ],
    suggestions: [
      "¿Cómo renuevo mi Medi-Cal?",
      "Me cortaron el Medi-Cal. ¿Qué hago?",
      "¿Mi familia puede recibir ayuda para comida?",
    ],
    notConfigured: "La IA de Costa todavía no está configurada en este servidor.",
  },
  zh: {
    tagline: "用您的语言获得福利帮助。",
    subtitle: "打电话、发短信、提问。免费帮助您了解 Medi-Cal、CalFresh、WIC、税收抵免和灾害援助。无需账户，无需下载应用。",
    call: "打电话给 Costa",
    text: "发短信给 Costa",
    ask: "问 Costa",
    askPlaceholder: "用任何语言提问…",
    send: "发送",
    thinking: "Costa 正在查询官方资料…",
    letterCta: "收到看不懂的信？拍张照片",
    letterTitle: "看懂福利信件",
    letterIntro: "拍下 Medi-Cal、CalFresh 或其他福利信件的照片。Costa 会用您的语言解释。照片不会被保存。",
    letterChoose: "拍照或选择照片",
    letterAnalyze: "解释这封信",
    letterAnalyzing: "正在阅读您的信件…",
    whatThisMeans: "这是什么意思",
    whatToDo: "您需要做什么",
    deadline: "截止日期",
    needHelp: "需要帮助吗？",
    needHelpBody: "本地帮助人员可以给您回电话或发短信。",
    requestHelp: "请真人帮助我",
    phoneLabel: "您的电话号码",
    consentLabel: "我同意把这个请求分享给本地福利帮助人员。",
    requestSent: "请求已发送。您的参考号码是",
    sources: "已核实的来源",
    privacyNote: "请不要分享您的社会安全号码、ITIN 或 Medi-Cal 卡号。",
    redactedWarning: "我们在发送前已从您的消息中删除了私人号码。",
    safetyTitle: "Costa 如何保护您",
    safetyItems: [
      "所有回答只来自政府官方资料，并附上链接。",
      "Costa 从不决定您是否符合资格，只有政府机构可以决定。",
      "社会安全号码等私人号码在发送或保存前会被删除。",
      "Costa 从不询问移民身份。",
      "您随时可以要求与真人交谈。",
      "消息会在 30 天后删除。",
    ],
    suggestions: ["我怎么续保 Medi-Cal？", "我的 Medi-Cal 被停了，怎么办？", "我家可以申请食物补助吗？"],
    notConfigured: "此服务器尚未配置 Costa 的 AI。",
  },
  tl: {
    tagline: "Tulong sa benepisyo sa sarili mong wika.",
    subtitle: "Tumawag. Mag-text. Magtanong. Libreng tulong sa Medi-Cal, CalFresh, WIC, tax credit, at tulong sa sakuna. Walang account. Walang app.",
    call: "Tawagan si Costa",
    text: "I-text si Costa",
    ask: "Magtanong kay Costa",
    askPlaceholder: "Magtanong sa kahit anong wika…",
    send: "Ipadala",
    thinking: "Tinitingnan ni Costa ang mga opisyal na source…",
    letterCta: "May nakakalitong sulat? Kunan ng litrato",
    letterTitle: "Intindihin ang sulat tungkol sa benepisyo",
    letterIntro: "Kunan ng litrato ang sulat mula sa Medi-Cal, CalFresh, o ibang benepisyo. Ipapaliwanag ito ni Costa sa iyong wika. Hindi sine-save ang litrato.",
    letterChoose: "Kumuha o pumili ng litrato",
    letterAnalyze: "Ipaliwanag ang sulat",
    letterAnalyzing: "Binabasa ang iyong sulat…",
    whatThisMeans: "Ano ang ibig sabihin nito",
    whatToDo: "Ano ang kailangan mong gawin",
    deadline: "Deadline",
    needHelp: "Kailangan ng tulong?",
    needHelpBody: "Puwede kang tawagan o i-text ng lokal na tagatulong.",
    requestHelp: "Humingi ng tulong sa isang tao",
    phoneLabel: "Iyong numero ng telepono",
    consentLabel: "Pumapayag akong ibahagi ang request na ito sa isang lokal na tagatulong.",
    requestSent: "Naipadala na. Ang iyong reference number ay",
    sources: "Mga beripikadong source",
    privacyNote: "Huwag ibahagi ang iyong Social Security number, ITIN, o Medi-Cal ID number.",
    redactedWarning: "Tinanggal namin ang isang pribadong numero sa iyong mensahe bago ito ipadala.",
    safetyTitle: "Paano pinapanatiling ligtas ni Costa",
    safetyItems: [
      "Ang mga sagot ay galing lang sa opisyal na source ng gobyerno, may link sa bawat isa.",
      "Hindi kailanman nagpapasya si Costa kung kwalipikado ka. Ang ahensya lang ang puwede.",
      "Tinatanggal ang mga pribadong numero tulad ng SSN bago magpadala o mag-save.",
      "Hindi kailanman nagtatanong si Costa tungkol sa immigration status.",
      "Puwede kang humingi ng totoong tao anumang oras.",
      "Binubura ang mga mensahe pagkalipas ng 30 araw.",
    ],
    suggestions: [
      "Paano ko ire-renew ang Medi-Cal ko?",
      "Natigil ang Medi-Cal ko. Ano ang gagawin ko?",
      "Puwede bang makakuha ng tulong sa pagkain ang pamilya ko?",
    ],
    notConfigured: "Hindi pa naka-configure ang AI ni Costa sa server na ito.",
  },
  vi: {
    tagline: "Trợ giúp phúc lợi bằng ngôn ngữ của bạn.",
    subtitle: "Gọi. Nhắn tin. Hỏi. Trợ giúp miễn phí về Medi-Cal, CalFresh, WIC, tín thuế và trợ giúp thiên tai. Không cần tài khoản. Không cần ứng dụng.",
    call: "Gọi Costa",
    text: "Nhắn tin cho Costa",
    ask: "Hỏi Costa",
    askPlaceholder: "Hỏi bằng bất kỳ ngôn ngữ nào…",
    send: "Gửi",
    thinking: "Costa đang kiểm tra nguồn chính thức…",
    letterCta: "Nhận được thư khó hiểu? Chụp ảnh lại",
    letterTitle: "Hiểu thư về phúc lợi",
    letterIntro: "Chụp ảnh thư Medi-Cal, CalFresh hoặc phúc lợi khác. Costa sẽ giải thích bằng ngôn ngữ của bạn. Ảnh không được lưu lại.",
    letterChoose: "Chụp hoặc chọn ảnh",
    letterAnalyze: "Giải thích thư này",
    letterAnalyzing: "Đang đọc thư của bạn…",
    whatThisMeans: "Thư này có nghĩa là gì",
    whatToDo: "Bạn cần làm gì",
    deadline: "Hạn chót",
    needHelp: "Cần giúp đỡ?",
    needHelpBody: "Nhân viên hỗ trợ địa phương có thể gọi lại hoặc nhắn tin cho bạn.",
    requestHelp: "Nhờ một người giúp tôi",
    phoneLabel: "Số điện thoại của bạn",
    consentLabel: "Tôi đồng ý chia sẻ yêu cầu này với nhân viên hỗ trợ phúc lợi địa phương.",
    requestSent: "Đã gửi yêu cầu. Số tham chiếu của bạn là",
    sources: "Nguồn đã xác minh",
    privacyNote: "Đừng bao giờ chia sẻ số An Sinh Xã Hội, ITIN hoặc số thẻ Medi-Cal.",
    redactedWarning: "Chúng tôi đã xóa một số riêng tư khỏi tin nhắn của bạn trước khi gửi.",
    safetyTitle: "Costa bảo vệ bạn như thế nào",
    safetyItems: [
      "Câu trả lời chỉ đến từ nguồn chính thức của chính phủ, kèm đường dẫn.",
      "Costa không bao giờ quyết định bạn có đủ điều kiện hay không. Chỉ cơ quan mới quyết định.",
      "Các số riêng tư như SSN được xóa trước khi gửi hoặc lưu.",
      "Costa không bao giờ hỏi về tình trạng di trú.",
      "Bạn có thể yêu cầu nói chuyện với người thật bất cứ lúc nào.",
      "Tin nhắn được xóa sau 30 ngày.",
    ],
    suggestions: [
      "Làm sao để gia hạn Medi-Cal?",
      "Medi-Cal của tôi bị cắt. Tôi phải làm gì?",
      "Gia đình tôi có thể nhận trợ giúp thực phẩm không?",
    ],
    notConfigured: "AI của Costa chưa được cấu hình trên máy chủ này.",
  },
};

/** First-message notice for SMS, sent once per phone number. */
export const SMS_CONSENT: Record<LanguageCode, string> = {
  en: "Costa: free benefits help. Info comes from official sources; Costa can't decide eligibility. Never text your SSN or Medi-Cal ID. Msgs deleted after 30 days. Reply STOP to stop.",
  es: "Costa: ayuda gratis con beneficios. La información viene de fuentes oficiales; Costa no decide si califica. Nunca envíe su Seguro Social ni número de Medi-Cal. Mensajes se borran en 30 días. Responda STOP para parar.",
  zh: "Costa：免费福利帮助。信息来自官方资料；Costa 不能决定您的资格。请勿发送社会安全号码或 Medi-Cal 卡号。消息 30 天后删除。回复 STOP 停止。",
  tl: "Costa: libreng tulong sa benepisyo. Galing sa opisyal na source ang impormasyon; hindi nagpapasya si Costa sa eligibility. Huwag i-text ang SSN o Medi-Cal ID. Binubura ang msg sa loob ng 30 araw. Reply STOP para huminto.",
  vi: "Costa: trợ giúp phúc lợi miễn phí. Thông tin từ nguồn chính thức; Costa không quyết định điều kiện. Đừng nhắn số An Sinh Xã Hội hay số Medi-Cal. Tin nhắn xóa sau 30 ngày. Trả lời STOP để dừng.",
};

export const VOICE: Record<
  LanguageCode,
  { howCanIHelp: string; anythingElse: string; didntHear: string; goodbye: string; oneMoment: string }
> = {
  en: {
    howCanIHelp: "How can I help you today?",
    anythingElse: "Is there anything else I can help with?",
    didntHear: "Sorry, I didn't hear you. Please tell me how I can help.",
    goodbye: "Thank you for calling Costa. Goodbye.",
    oneMoment: "One moment while I check.",
  },
  es: {
    howCanIHelp: "¿En qué le puedo ayudar hoy?",
    anythingElse: "¿Hay algo más en que le pueda ayudar?",
    didntHear: "Perdón, no le escuché. Dígame en qué le puedo ayudar.",
    goodbye: "Gracias por llamar a Costa. Adiós.",
    oneMoment: "Un momento, estoy revisando.",
  },
  zh: {
    howCanIHelp: "今天我可以怎么帮助您？",
    anythingElse: "还有其他需要帮助的吗？",
    didntHear: "抱歉，我没有听到。请告诉我您需要什么帮助。",
    goodbye: "谢谢您致电 Costa。再见。",
    oneMoment: "请稍等，我查一下。",
  },
  tl: {
    howCanIHelp: "Paano kita matutulungan ngayon?",
    anythingElse: "May iba pa ba akong maitutulong?",
    didntHear: "Pasensya, hindi kita narinig. Pakisabi kung paano kita matutulungan.",
    goodbye: "Salamat sa pagtawag kay Costa. Paalam.",
    oneMoment: "Sandali lang, titingnan ko.",
  },
  vi: {
    howCanIHelp: "Hôm nay tôi có thể giúp gì cho bạn?",
    anythingElse: "Bạn còn cần giúp gì nữa không?",
    didntHear: "Xin lỗi, tôi không nghe rõ. Hãy cho tôi biết tôi có thể giúp gì.",
    goodbye: "Cảm ơn bạn đã gọi Costa. Tạm biệt.",
    oneMoment: "Xin chờ một chút để tôi kiểm tra.",
  },
};

export interface LetterStrings {
  unreadable: string;
  notLetter: string;
  error: string;
  uncertain: string;
  daysLeft: (n: number) => string;
  dueToday: string;
  overdue: string;
  another: string;
  back: string;
  areaLabel: string;
  contactBy: string;
  callMe: string;
  textMe: string;
  sending: string;
  fromLetter: string;
}

export const LETTER_UI: Record<LanguageCode, LetterStrings> = {
  en: {
    unreadable: "Costa couldn't read that photo. Try again with the whole page, flat, in good light.",
    notLetter: "That doesn't look like a benefits letter. Try a photo of the letter itself.",
    error: "Something went wrong. Please try again.",
    uncertain: "Costa isn't sure about",
    daysLeft: (n) => `${n} day${n === 1 ? "" : "s"} left`,
    dueToday: "Due today",
    overdue: "This date has passed. Act now; you may still have options.",
    another: "Explain another letter",
    back: "Back",
    areaLabel: "Your city",
    contactBy: "Contact me by",
    callMe: "Phone call",
    textMe: "Text message",
    sending: "Sending…",
    fromLetter: "Read from your letter",
  },
  es: {
    unreadable: "Costa no pudo leer la foto. Intente otra vez con toda la página, plana y con buena luz.",
    notLetter: "No parece una carta de beneficios. Intente con una foto de la carta.",
    error: "Algo salió mal. Intente de nuevo.",
    uncertain: "Costa no está seguro sobre",
    daysLeft: (n) => `Quedan ${n} día${n === 1 ? "" : "s"}`,
    dueToday: "Vence hoy",
    overdue: "Esta fecha ya pasó. Actúe ahora; todavía puede tener opciones.",
    another: "Explicar otra carta",
    back: "Regresar",
    areaLabel: "Su ciudad",
    contactBy: "Contácteme por",
    callMe: "Llamada",
    textMe: "Mensaje de texto",
    sending: "Enviando…",
    fromLetter: "Leído de su carta",
  },
  zh: {
    unreadable: "Costa 无法看清这张照片。请把整页放平，在光线充足处重新拍摄。",
    notLetter: "这看起来不像福利信件。请拍摄信件本身。",
    error: "出了点问题，请再试一次。",
    uncertain: "Costa 不确定的地方：",
    daysLeft: (n) => `还剩 ${n} 天`,
    dueToday: "今天截止",
    overdue: "这个日期已经过了。请马上行动，您可能仍有办法。",
    another: "解释另一封信",
    back: "返回",
    areaLabel: "您所在的城市",
    contactBy: "联系方式",
    callMe: "打电话",
    textMe: "发短信",
    sending: "正在发送…",
    fromLetter: "从您的信中读取",
  },
  tl: {
    unreadable: "Hindi mabasa ni Costa ang litrato. Subukan ulit: buong pahina, nakalapag, sa maliwanag na lugar.",
    notLetter: "Mukhang hindi ito sulat tungkol sa benepisyo. Subukan ang litrato ng mismong sulat.",
    error: "May nangyaring mali. Subukan ulit.",
    uncertain: "Hindi sigurado si Costa tungkol sa",
    daysLeft: (n) => `${n} araw na lang`,
    dueToday: "Deadline ngayong araw",
    overdue: "Lumipas na ang petsang ito. Kumilos agad; baka may paraan pa.",
    another: "Ipaliwanag ang ibang sulat",
    back: "Bumalik",
    areaLabel: "Iyong lungsod",
    contactBy: "Kontakin ako sa",
    callMe: "Tawag",
    textMe: "Text",
    sending: "Ipinapadala…",
    fromLetter: "Nabasa mula sa iyong sulat",
  },
  vi: {
    unreadable: "Costa không đọc được ảnh. Hãy chụp lại cả trang, để phẳng, đủ ánh sáng.",
    notLetter: "Đây có vẻ không phải thư phúc lợi. Hãy chụp chính lá thư.",
    error: "Đã có lỗi. Vui lòng thử lại.",
    uncertain: "Costa chưa chắc chắn về",
    daysLeft: (n) => `Còn ${n} ngày`,
    dueToday: "Hạn chót hôm nay",
    overdue: "Ngày này đã qua. Hãy hành động ngay; bạn có thể vẫn còn lựa chọn.",
    another: "Giải thích thư khác",
    back: "Quay lại",
    areaLabel: "Thành phố của bạn",
    contactBy: "Liên hệ với tôi qua",
    callMe: "Gọi điện",
    textMe: "Tin nhắn",
    sending: "Đang gửi…",
    fromLetter: "Đọc từ thư của bạn",
  },
};
