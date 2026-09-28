import type { LanguageCode } from "@/lib/languages";

export type TopicId = "health" | "food" | "money" | "disaster";
export type ProgramId = "medi-cal" | "calfresh" | "wic" | "caleitc";
export type ScreenStatus = "likely" | "possibly" | "unlikely" | "need-more-info";
export type ProviderKind = "county" | "state" | "legal" | "community" | "federal";

/**
 * Strings for the mobile app screens. Wording rules: never say someone "qualifies"
 * (only "may"), never ask about immigration status, keep sentences short.
 */
export interface AppStrings {
  nav: { home: string; ask: string; check: string; letter: string; help: string };
  common: {
    back: string;
    next: string;
    yes: string;
    no: string;
    notSure: string;
    call: string;
    website: string;
    map: string;
    close: string;
    save: string;
    remove: string;
    language: string;
    chooseLanguage: string;
    listen: string;
    stop: string;
    stepOf: (n: number, total: number) => string;
    stayPrivate: string;
    emergency: string;
  };
  privacy: { title: string; body: string; deleteButton: string; confirm: string; done: string };
  home: {
    greeting: string;
    askCta: string;
    talkCta: string;
    topicsTitle: string;
    topics: Record<TopicId | "letter" | "person", { title: string; sub: string }>;
    checkTitle: string;
    checkBody: string;
    checkCta: string;
    planTitle: string;
    planEmpty: string;
    stepsProgress: (done: number, total: number) => string;
    remindersTitle: string;
    addReminder: string;
    reminderWhat: string;
    reminderWhatPlaceholder: string;
    reminderWhen: string;
    addToCalendar: string;
    reachTitle: string;
  };
  topics: Record<TopicId, { title: string; intro: string }> & {
    questions: string;
    actions: string;
    doCheck: string;
    doLetter: string;
    doHelp: string;
    doAsk: string;
    sourcesTitle: string;
  };
  check: {
    title: string;
    intro: string;
    promises: string[];
    start: string;
    county: { q: string; sanMateo: string; sanMateoHint: string; santaClara: string; santaClaraHint: string; other: string };
    size: { q: string; hint: string };
    who: {
      q: string;
      hint: string;
      pregnant: string;
      baby: string;
      young: string;
      kid: string;
      senior: string;
      disability: string;
      none: string;
    };
    kids: { q: string };
    income: {
      q: string;
      hint: string;
      amount: string;
      week: string;
      twoWeeks: string;
      month: string;
      year: string;
      none: string;
    };
    work: { q: string; hint: string };
    benefits: { q: string };
    seeResults: string;
    resultsTitle: string;
    resultsIntro: string;
    status: Record<ScreenStatus, string>;
    programs: Record<ProgramId, { name: string; what: string }>;
    groups: { adults: string; children: string; pregnancy: string; senior: string };
    yourIncome: (amount: string) => string;
    limitFor: (size: number, amount: string) => string;
    upTo: (amount: string) => string;
    notes: {
      pregnantCounts: string;
      kidsAnyStatus: string;
      seniorRules: string;
      wicAuto: string;
      wicNotInGroup: string;
      wicNoSsn: string;
      eitcFile: string;
      eitcId: string;
      eitcYctc: (amount: string) => string;
      eitcNoWork: string;
      coveredCa: string;
      calfreshAmount: string;
    };
    nextSteps: string;
    steps: Record<ProgramId, string>;
    savePlan: string;
    saved: string;
    getHelp: string;
    startOver: string;
    disclaimer: string;
  };
  ask: {
    title: string;
    emptyTitle: string;
    emptyBody: string;
    micStart: string;
    micStop: string;
    transcribing: string;
    micError: string;
    micBlocked: string;
    newChat: string;
    talkToPerson: string;
    talkToPersonMessage: string;
  };
  help: {
    title: string;
    intro: string;
    whereLabel: string;
    wherePlaceholder: string;
    search: string;
    showingFor: Record<"san-mateo" | "santa-clara", string>;
    outside: string;
    localTitle: string;
    statewideTitle: string;
    kinds: Record<ProviderKind, string>;
    interpreters: string;
    speaks: (languages: string) => string;
    personTitle: string;
    personBody: string;
    topicLabel: string;
    topicOptions: Record<ProgramId | "disaster" | "other", string>;
    noteLabel: string;
    notePlaceholder: string;
    includeCheckup: string;
    partners: string;
  };
  letter: { saveDeadline: string; deadlineSaved: string; reminderTitle: string };
  languageNames: Record<LanguageCode, string>;
}

export const APP: Record<LanguageCode, AppStrings> = {
  en: {
    nav: { home: "Home", ask: "Ask", check: "Check", letter: "Letter", help: "Help" },
    common: {
      back: "Back",
      next: "Next",
      yes: "Yes",
      no: "No",
      notSure: "Not sure",
      call: "Call",
      website: "Website",
      map: "Map",
      close: "Close",
      save: "Save",
      remove: "Remove",
      language: "Language",
      chooseLanguage: "Choose your language",
      listen: "Listen",
      stop: "Stop",
      stepOf: (n, total) => `Step ${n} of ${total}`,
      stayPrivate: "Your answers stay on this phone.",
      emergency: "In an emergency, call 911.",
    },
    privacy: {
      title: "Your privacy",
      body: "Costa never asks about immigration status. Your plan, reminders, and checkup answers are saved only on this phone. Chats are deleted from our server after 30 days.",
      deleteButton: "Delete everything on this phone",
      confirm: "Delete your chat, plan, and reminders from this phone?",
      done: "Deleted.",
    },
    home: {
      greeting: "Hi! How can Costa help you today?",
      askCta: "Ask a question…",
      talkCta: "Talk",
      topicsTitle: "What do you need help with?",
      topics: {
        health: { title: "Health care", sub: "Medi-Cal" },
        food: { title: "Food", sub: "CalFresh, WIC" },
        money: { title: "Money back", sub: "Tax credits" },
        letter: { title: "A letter", sub: "Take a photo" },
        disaster: { title: "Fire, flood, outage", sub: "Disaster help" },
        person: { title: "A real person", sub: "Free local help" },
      },
      checkTitle: "See what your family may get",
      checkBody: "5 quick questions. About 2 minutes. No names, no ID numbers.",
      checkCta: "Start the checkup",
      planTitle: "My plan",
      planEmpty: "Steps and deadlines you save will show here.",
      stepsProgress: (done, total) => `${done} of ${total} done`,
      remindersTitle: "Deadlines",
      addReminder: "Add a deadline",
      reminderWhat: "What is due?",
      reminderWhatPlaceholder: "Example: Medi-Cal renewal form",
      reminderWhen: "Due date",
      addToCalendar: "Add to calendar",
      reachTitle: "Prefer to call or text?",
    },
    topics: {
      health: { title: "Health care (Medi-Cal)", intro: "Medi-Cal is free or low-cost health insurance. Get help applying, renewing, or fixing a problem." },
      food: { title: "Food help", intro: "CalFresh gives money for food each month. WIC gives healthy food to pregnant people, new parents, and young children." },
      money: { title: "Money back at tax time", intro: "Working families can get cash back from California when they file taxes, even with an ITIN." },
      disaster: { title: "After a fire, flood, or power outage", intro: "Help to replace food, find shelter, and recover after a disaster." },
      questions: "Common questions",
      actions: "What you can do",
      doCheck: "Check what you may get",
      doLetter: "Explain a letter",
      doHelp: "Find free help nearby",
      doAsk: "Ask a different question",
      sourcesTitle: "Official sources",
    },
    check: {
      title: "Benefits checkup",
      intro: "Answer a few questions to see which programs your family may be able to get.",
      promises: ["We never ask about immigration status.", "No names, no Social Security numbers.", "Your answers stay on this phone."],
      start: "Start",
      county: {
        q: "Where do you live?",
        sanMateo: "San Mateo County",
        sanMateoHint: "Half Moon Bay, Pescadero, Redwood City, East Palo Alto…",
        santaClara: "Santa Clara County",
        santaClaraHint: "San José, Gilroy, Morgan Hill, Sunnyvale…",
        other: "Somewhere else in California",
      },
      size: { q: "How many people live with you and share meals?", hint: "Count yourself, your children, and anyone you buy and cook food with." },
      who: {
        q: "Does anyone in your home fit these?",
        hint: "Choose all that apply.",
        pregnant: "Someone is pregnant",
        baby: "A baby under 1",
        young: "A child 1 to 5",
        kid: "A child 6 to 18",
        senior: "Someone 65 or older",
        disability: "Someone with a disability",
        none: "None of these",
      },
      kids: { q: "How many children under 19 live with you?" },
      income: {
        q: "About how much does your household earn before taxes?",
        hint: "Add up everyone's pay, including farm or seasonal work. A good guess is fine.",
        amount: "Amount in dollars",
        week: "Each week",
        twoWeeks: "Every 2 weeks",
        month: "Each month",
        year: "Each year (seasonal work)",
        none: "No income right now",
      },
      work: { q: "Does most of this money come from work?", hint: "Work includes farm work, cleaning, day labor, or your own small business." },
      benefits: { q: "Does anyone in your home already get Medi-Cal, CalFresh, or CalWORKs?" },
      seeResults: "See my results",
      resultsTitle: "What your family may be able to get",
      resultsIntro: "Based on your answers. Tap a program to see why and what to do next.",
      status: { likely: "Good chance", possibly: "Worth applying", unlikely: "Probably not by income", "need-more-info": "Need more information" },
      programs: {
        "medi-cal": { name: "Medi-Cal", what: "Free or low-cost health care" },
        calfresh: { name: "CalFresh", what: "Money for food every month" },
        wic: { name: "WIC", what: "Healthy food for moms, babies, and kids under 5" },
        caleitc: { name: "CalEITC", what: "Cash back when you file taxes" },
      },
      groups: { adults: "Adults", children: "Children", pregnancy: "Pregnancy", senior: "65+ or disability" },
      yourIncome: (a) => `Your income: ${a} a month`,
      limitFor: (size, a) => `Limit for ${size} ${size === 1 ? "person" : "people"}: ${a} a month`,
      upTo: (a) => `Up to ${a}`,
      notes: {
        pregnantCounts: "A pregnant person counts as two people for Medi-Cal and WIC. We added the baby for you.",
        kidsAnyStatus: "Children under 19 can get full Medi-Cal no matter their immigration status, if they meet the income rules.",
        seniorRules: "People 65 or older or with a disability have different rules. The county also looks at savings.",
        wicAuto: "Because someone gets Medi-Cal, CalFresh, or CalWORKs, your family meets the WIC income rule.",
        wicNotInGroup: "WIC is only for pregnant people, new parents, and children under 5.",
        wicNoSsn: "WIC does not require a Social Security number or proof of citizenship.",
        eitcFile: "You get it by filing a California tax return, even if you owe no tax.",
        eitcId: "You need a Social Security number or an ITIN to file. The IRS gives ITINs.",
        eitcYctc: (a) => `Families with a child under 6 may also get up to ${a} more (Young Child Tax Credit).`,
        eitcNoWork: "CalEITC is for money earned from work.",
        coveredCa: "If Medi-Cal is not an option, Covered California can help lower the cost of health insurance: 1-800-300-1506.",
        calfreshAmount: "The amount depends on your income and costs like rent.",
      },
      nextSteps: "What to do next",
      steps: {
        "medi-cal": "Apply for Medi-Cal at BenefitsCal.com or by calling your county.",
        calfresh: "Apply for CalFresh at BenefitsCal.com or call 1-877-847-3663.",
        wic: "Call WIC at 1-800-852-5770 to make an appointment.",
        caleitc: "File a California tax return to get CalEITC. Free tax help: 1-800-906-9887.",
      },
      savePlan: "Save these steps to my plan",
      saved: "Saved to your plan",
      getHelp: "Get free help applying",
      startOver: "Start over",
      disclaimer: "This is an estimate, not a decision. Only the county or agency can decide, after you apply.",
    },
    ask: {
      title: "Ask Costa",
      emptyTitle: "Ask anything about benefits",
      emptyBody: "Type, or tap the microphone and talk in your language.",
      micStart: "Tap to talk",
      micStop: "Listening… tap to stop",
      transcribing: "Writing down your words…",
      micError: "Costa couldn't hear that. Try again, or type your question.",
      micBlocked: "Allow the microphone in your browser settings to talk to Costa.",
      newChat: "New chat",
      talkToPerson: "Talk to a person",
      talkToPersonMessage: "I want to talk to a real person.",
    },
    help: {
      title: "Free help near you",
      intro: "Trusted places that help with benefits at no cost. You can ask for an interpreter.",
      whereLabel: "Your city or ZIP code",
      wherePlaceholder: "Example: Half Moon Bay or 95020",
      search: "Search",
      showingFor: { "san-mateo": "Showing help in San Mateo County", "santa-clara": "Showing help in Santa Clara County" },
      outside: "Costa lists local offices only for San Mateo and Santa Clara counties. These phone lines help anywhere in California.",
      localTitle: "Near you",
      statewideTitle: "Phone lines for all of California",
      kinds: { county: "County office", state: "State phone line", legal: "Free legal help", community: "Community organization", federal: "Federal program" },
      interpreters: "Free interpreter: ask for your language",
      speaks: (l) => `Staff speak ${l}`,
      personTitle: "Ask a person to contact you",
      personBody: "A local helper can call or text you back, in your language, for free.",
      topicLabel: "What do you need help with?",
      topicOptions: { "medi-cal": "Medi-Cal", calfresh: "CalFresh (food)", wic: "WIC", caleitc: "Taxes and CalEITC", disaster: "Disaster help", other: "Something else" },
      noteLabel: "Anything they should know? (optional)",
      notePlaceholder: "Example: my renewal is due next week",
      includeCheckup: "Share my checkup results (no names or numbers)",
      partners: "For partner organizations",
    },
    letter: { saveDeadline: "Save to my deadlines", deadlineSaved: "Saved to your deadlines", reminderTitle: "Letter deadline" },
    languageNames: { en: "English", es: "Spanish", zh: "Chinese", tl: "Tagalog", vi: "Vietnamese" },
  },

  es: {
    nav: { home: "Inicio", ask: "Preguntar", check: "Revisar", letter: "Carta", help: "Ayuda" },
    common: {
      back: "Regresar",
      next: "Siguiente",
      yes: "Sí",
      no: "No",
      notSure: "No sé",
      call: "Llamar",
      website: "Sitio web",
      map: "Mapa",
      close: "Cerrar",
      save: "Guardar",
      remove: "Quitar",
      language: "Idioma",
      chooseLanguage: "Elija su idioma",
      listen: "Escuchar",
      stop: "Parar",
      stepOf: (n, total) => `Paso ${n} de ${total}`,
      stayPrivate: "Sus respuestas se quedan en este teléfono.",
      emergency: "En una emergencia, llame al 911.",
    },
    privacy: {
      title: "Su privacidad",
      body: "Costa nunca pregunta sobre estatus migratorio. Su plan, recordatorios y respuestas se guardan solo en este teléfono. Los chats se borran de nuestro servidor después de 30 días.",
      deleteButton: "Borrar todo en este teléfono",
      confirm: "¿Borrar su chat, plan y recordatorios de este teléfono?",
      done: "Borrado.",
    },
    home: {
      greeting: "¡Hola! ¿En qué le puede ayudar Costa hoy?",
      askCta: "Haga una pregunta…",
      talkCta: "Hablar",
      topicsTitle: "¿Con qué necesita ayuda?",
      topics: {
        health: { title: "Salud", sub: "Medi-Cal" },
        food: { title: "Comida", sub: "CalFresh, WIC" },
        money: { title: "Dinero de vuelta", sub: "Créditos de impuestos" },
        letter: { title: "Una carta", sub: "Tome una foto" },
        disaster: { title: "Incendio, inundación, apagón", sub: "Ayuda por desastre" },
        person: { title: "Una persona", sub: "Ayuda local gratis" },
      },
      checkTitle: "Vea qué puede recibir su familia",
      checkBody: "5 preguntas rápidas. Unos 2 minutos. Sin nombres ni números de identificación.",
      checkCta: "Empezar",
      planTitle: "Mi plan",
      planEmpty: "Aquí verá los pasos y fechas límite que guarde.",
      stepsProgress: (done, total) => `${done} de ${total} listos`,
      remindersTitle: "Fechas límite",
      addReminder: "Agregar fecha límite",
      reminderWhat: "¿Qué tiene que entregar?",
      reminderWhatPlaceholder: "Ejemplo: formulario de renovación de Medi-Cal",
      reminderWhen: "Fecha límite",
      addToCalendar: "Agregar al calendario",
      reachTitle: "¿Prefiere llamar o enviar un texto?",
    },
    topics: {
      health: { title: "Salud (Medi-Cal)", intro: "Medi-Cal es seguro médico gratis o de bajo costo. Reciba ayuda para solicitar, renovar o arreglar un problema." },
      food: { title: "Ayuda para comida", intro: "CalFresh da dinero para comida cada mes. WIC da comida saludable a personas embarazadas, padres de bebés y niños pequeños." },
      money: { title: "Dinero de vuelta con los impuestos", intro: "Las familias que trabajan pueden recibir dinero de California al declarar impuestos, incluso con un ITIN." },
      disaster: { title: "Después de un incendio, inundación o apagón", intro: "Ayuda para reponer comida, encontrar refugio y recuperarse después de un desastre." },
      questions: "Preguntas frecuentes",
      actions: "Lo que puede hacer",
      doCheck: "Revisar qué puede recibir",
      doLetter: "Explicar una carta",
      doHelp: "Buscar ayuda gratis cerca",
      doAsk: "Hacer otra pregunta",
      sourcesTitle: "Fuentes oficiales",
    },
    check: {
      title: "Revisión de beneficios",
      intro: "Conteste unas preguntas para ver qué programas podría recibir su familia.",
      promises: ["Nunca preguntamos sobre estatus migratorio.", "Sin nombres ni números de Seguro Social.", "Sus respuestas se quedan en este teléfono."],
      start: "Empezar",
      county: {
        q: "¿Dónde vive?",
        sanMateo: "Condado de San Mateo",
        sanMateoHint: "Half Moon Bay, Pescadero, Redwood City, East Palo Alto…",
        santaClara: "Condado de Santa Clara",
        santaClaraHint: "San José, Gilroy, Morgan Hill, Sunnyvale…",
        other: "En otra parte de California",
      },
      size: { q: "¿Cuántas personas viven con usted y comparten la comida?", hint: "Cuéntese a usted, a sus hijos y a quienes compran y cocinan con usted." },
      who: {
        q: "¿Alguien en su casa es así?",
        hint: "Elija todas las que apliquen.",
        pregnant: "Alguien está embarazada",
        baby: "Un bebé menor de 1 año",
        young: "Un niño de 1 a 5 años",
        kid: "Un niño de 6 a 18 años",
        senior: "Alguien de 65 años o más",
        disability: "Alguien con una discapacidad",
        none: "Ninguna de estas",
      },
      kids: { q: "¿Cuántos niños menores de 19 años viven con usted?" },
      income: {
        q: "¿Cuánto gana su familia más o menos, antes de impuestos?",
        hint: "Sume el pago de todos, incluido el trabajo del campo o de temporada. Un cálculo aproximado está bien.",
        amount: "Cantidad en dólares",
        week: "Cada semana",
        twoWeeks: "Cada 2 semanas",
        month: "Cada mes",
        year: "Cada año (trabajo de temporada)",
        none: "Sin ingresos ahora",
      },
      work: { q: "¿La mayor parte de este dinero viene del trabajo?", hint: "Trabajo incluye el campo, limpieza, trabajo por día o su propio negocio." },
      benefits: { q: "¿Alguien en su casa ya recibe Medi-Cal, CalFresh o CalWORKs?" },
      seeResults: "Ver mis resultados",
      resultsTitle: "Lo que su familia podría recibir",
      resultsIntro: "Según sus respuestas. Toque un programa para ver por qué y qué hacer.",
      status: { likely: "Buena posibilidad", possibly: "Vale la pena solicitar", unlikely: "Probablemente no por ingresos", "need-more-info": "Falta información" },
      programs: {
        "medi-cal": { name: "Medi-Cal", what: "Atención médica gratis o de bajo costo" },
        calfresh: { name: "CalFresh", what: "Dinero para comida cada mes" },
        wic: { name: "WIC", what: "Comida saludable para mamás, bebés y niños menores de 5" },
        caleitc: { name: "CalEITC", what: "Dinero de vuelta al declarar impuestos" },
      },
      groups: { adults: "Adultos", children: "Niños", pregnancy: "Embarazo", senior: "65+ o discapacidad" },
      yourIncome: (a) => `Sus ingresos: ${a} al mes`,
      limitFor: (size, a) => `Límite para ${size} ${size === 1 ? "persona" : "personas"}: ${a} al mes`,
      upTo: (a) => `Hasta ${a}`,
      notes: {
        pregnantCounts: "Una persona embarazada cuenta como dos para Medi-Cal y WIC. Ya contamos al bebé.",
        kidsAnyStatus: "Los niños menores de 19 años pueden recibir Medi-Cal completo sin importar su estatus migratorio, si cumplen las reglas de ingresos.",
        seniorRules: "Las personas de 65 años o más o con discapacidad tienen otras reglas. El condado también revisa los ahorros.",
        wicAuto: "Como alguien recibe Medi-Cal, CalFresh o CalWORKs, su familia cumple la regla de ingresos de WIC.",
        wicNotInGroup: "WIC es solo para personas embarazadas, padres de bebés y niños menores de 5 años.",
        wicNoSsn: "WIC no pide número de Seguro Social ni prueba de ciudadanía.",
        eitcFile: "Se recibe al presentar una declaración de impuestos de California, aunque no deba impuestos.",
        eitcId: "Necesita un número de Seguro Social o un ITIN para declarar. El IRS da los ITIN.",
        eitcYctc: (a) => `Las familias con un niño menor de 6 años también podrían recibir hasta ${a} más (Crédito por Hijos Pequeños).`,
        eitcNoWork: "CalEITC es para dinero ganado con trabajo.",
        coveredCa: "Si Medi-Cal no es una opción, Covered California puede bajar el costo del seguro médico: 1-800-300-1506.",
        calfreshAmount: "La cantidad depende de sus ingresos y gastos como la renta.",
      },
      nextSteps: "Qué hacer ahora",
      steps: {
        "medi-cal": "Solicite Medi-Cal en BenefitsCal.com o llamando a su condado.",
        calfresh: "Solicite CalFresh en BenefitsCal.com o llame al 1-877-847-3663.",
        wic: "Llame a WIC al 1-800-852-5770 para hacer una cita.",
        caleitc: "Presente su declaración de impuestos de California para recibir CalEITC. Ayuda gratis: 1-800-906-9887.",
      },
      savePlan: "Guardar estos pasos en mi plan",
      saved: "Guardado en su plan",
      getHelp: "Recibir ayuda gratis para solicitar",
      startOver: "Empezar de nuevo",
      disclaimer: "Esto es un cálculo, no una decisión. Solo el condado o la agencia puede decidir, después de que usted solicite.",
    },
    ask: {
      title: "Pregúntele a Costa",
      emptyTitle: "Pregunte lo que quiera sobre beneficios",
      emptyBody: "Escriba, o toque el micrófono y hable en su idioma.",
      micStart: "Toque para hablar",
      micStop: "Escuchando… toque para parar",
      transcribing: "Escribiendo sus palabras…",
      micError: "Costa no le escuchó bien. Intente otra vez o escriba su pregunta.",
      micBlocked: "Permita el micrófono en la configuración del navegador para hablar con Costa.",
      newChat: "Nuevo chat",
      talkToPerson: "Hablar con una persona",
      talkToPersonMessage: "Quiero hablar con una persona.",
    },
    help: {
      title: "Ayuda gratis cerca de usted",
      intro: "Lugares de confianza que ayudan con beneficios sin costo. Puede pedir un intérprete.",
      whereLabel: "Su ciudad o código postal",
      wherePlaceholder: "Ejemplo: Half Moon Bay o 95020",
      search: "Buscar",
      showingFor: { "san-mateo": "Ayuda en el condado de San Mateo", "santa-clara": "Ayuda en el condado de Santa Clara" },
      outside: "Costa muestra oficinas locales solo para los condados de San Mateo y Santa Clara. Estas líneas ayudan en todo California.",
      localTitle: "Cerca de usted",
      statewideTitle: "Líneas para todo California",
      kinds: { county: "Oficina del condado", state: "Línea del estado", legal: "Ayuda legal gratis", community: "Organización comunitaria", federal: "Programa federal" },
      interpreters: "Intérprete gratis: pida su idioma",
      speaks: (l) => `El personal habla ${l}`,
      personTitle: "Pedir que una persona le contacte",
      personBody: "Una persona de ayuda local le puede llamar o enviar un texto en su idioma, gratis.",
      topicLabel: "¿Con qué necesita ayuda?",
      topicOptions: { "medi-cal": "Medi-Cal", calfresh: "CalFresh (comida)", wic: "WIC", caleitc: "Impuestos y CalEITC", disaster: "Ayuda por desastre", other: "Otra cosa" },
      noteLabel: "¿Algo que deban saber? (opcional)",
      notePlaceholder: "Ejemplo: mi renovación vence la próxima semana",
      includeCheckup: "Compartir mis resultados de la revisión (sin nombres ni números)",
      partners: "Para organizaciones aliadas",
    },
    letter: { saveDeadline: "Guardar en mis fechas límite", deadlineSaved: "Guardado en sus fechas límite", reminderTitle: "Fecha límite de la carta" },
    languageNames: { en: "inglés", es: "español", zh: "chino", tl: "tagalo", vi: "vietnamita" },
  },

  zh: {
    nav: { home: "首页", ask: "提问", check: "查询", letter: "信件", help: "帮助" },
    common: {
      back: "返回",
      next: "下一步",
      yes: "是",
      no: "否",
      notSure: "不确定",
      call: "打电话",
      website: "网站",
      map: "地图",
      close: "关闭",
      save: "保存",
      remove: "删除",
      language: "语言",
      chooseLanguage: "选择您的语言",
      listen: "朗读",
      stop: "停止",
      stepOf: (n, total) => `第 ${n} 步，共 ${total} 步`,
      stayPrivate: "您的回答只保存在这部手机上。",
      emergency: "紧急情况请拨打 911。",
    },
    privacy: {
      title: "您的隐私",
      body: "Costa 从不询问移民身份。您的计划、提醒和查询回答只保存在这部手机上。聊天记录会在 30 天后从我们的服务器删除。",
      deleteButton: "删除这部手机上的所有资料",
      confirm: "要从这部手机删除您的聊天、计划和提醒吗？",
      done: "已删除。",
    },
    home: {
      greeting: "您好！今天 Costa 可以怎么帮您？",
      askCta: "输入问题…",
      talkCta: "说话",
      topicsTitle: "您需要哪方面的帮助？",
      topics: {
        health: { title: "医疗保险", sub: "Medi-Cal" },
        food: { title: "食物", sub: "CalFresh、WIC" },
        money: { title: "退税", sub: "税收抵免" },
        letter: { title: "看不懂的信", sub: "拍张照片" },
        disaster: { title: "火灾、水灾、停电", sub: "灾害援助" },
        person: { title: "真人帮助", sub: "免费本地帮助" },
      },
      checkTitle: "看看您家可能获得哪些福利",
      checkBody: "5 个简单问题，大约 2 分钟。不需要姓名或证件号码。",
      checkCta: "开始查询",
      planTitle: "我的计划",
      planEmpty: "您保存的步骤和截止日期会显示在这里。",
      stepsProgress: (done, total) => `已完成 ${done}/${total}`,
      remindersTitle: "截止日期",
      addReminder: "添加截止日期",
      reminderWhat: "要交什么？",
      reminderWhatPlaceholder: "例如：Medi-Cal 续保表格",
      reminderWhen: "截止日期",
      addToCalendar: "加入日历",
      reachTitle: "想打电话或发短信？",
    },
    topics: {
      health: { title: "医疗保险（Medi-Cal）", intro: "Medi-Cal 是免费或低价的医疗保险。我们可以帮您申请、续保或解决问题。" },
      food: { title: "食物补助", intro: "CalFresh 每月提供买食物的钱。WIC 为孕妇、新手父母和幼儿提供健康食物。" },
      money: { title: "报税时拿回钱", intro: "有工作的家庭报税时可以从加州拿到退款，用 ITIN 也可以。" },
      disaster: { title: "火灾、水灾或停电之后", intro: "帮助您补回食物、找到住处，并在灾后恢复生活。" },
      questions: "常见问题",
      actions: "您可以做什么",
      doCheck: "查询可能获得的福利",
      doLetter: "解释一封信",
      doHelp: "寻找附近的免费帮助",
      doAsk: "问其他问题",
      sourcesTitle: "官方来源",
    },
    check: {
      title: "福利查询",
      intro: "回答几个问题，看看您家可能可以获得哪些福利。",
      promises: ["我们从不询问移民身份。", "不需要姓名或社会安全号码。", "您的回答只保存在这部手机上。"],
      start: "开始",
      county: {
        q: "您住在哪里？",
        sanMateo: "San Mateo 县",
        sanMateoHint: "Half Moon Bay、Pescadero、Redwood City、East Palo Alto…",
        santaClara: "Santa Clara 县",
        santaClaraHint: "San José、Gilroy、Morgan Hill、Sunnyvale…",
        other: "加州其他地方",
      },
      size: { q: "有几个人和您住在一起并一起吃饭？", hint: "包括您自己、您的孩子，以及和您一起买菜做饭的人。" },
      who: {
        q: "您家里有没有以下情况？",
        hint: "可以选多个。",
        pregnant: "有人怀孕",
        baby: "有 1 岁以下的婴儿",
        young: "有 1 到 5 岁的孩子",
        kid: "有 6 到 18 岁的孩子",
        senior: "有 65 岁或以上的人",
        disability: "有残障人士",
        none: "都没有",
      },
      kids: { q: "有几个 19 岁以下的孩子和您住在一起？" },
      income: {
        q: "您家税前大约赚多少钱？",
        hint: "把每个人的收入加起来，包括农场或季节性工作。大概估计就可以。",
        amount: "金额（美元）",
        week: "每周",
        twoWeeks: "每两周",
        month: "每月",
        year: "每年（季节性工作）",
        none: "目前没有收入",
      },
      work: { q: "这些钱主要来自工作吗？", hint: "工作包括农场工作、清洁、临时工或自己的小生意。" },
      benefits: { q: "您家里有人已经在领 Medi-Cal、CalFresh 或 CalWORKs 吗？" },
      seeResults: "查看结果",
      resultsTitle: "您家可能可以获得的福利",
      resultsIntro: "根据您的回答。点一下项目，看看原因和下一步。",
      status: { likely: "机会很大", possibly: "值得申请", unlikely: "按收入可能不行", "need-more-info": "需要更多资料" },
      programs: {
        "medi-cal": { name: "Medi-Cal", what: "免费或低价的医疗" },
        calfresh: { name: "CalFresh", what: "每月买食物的钱" },
        wic: { name: "WIC", what: "给妈妈、婴儿和 5 岁以下孩子的健康食物" },
        caleitc: { name: "CalEITC", what: "报税时拿回的钱" },
      },
      groups: { adults: "成人", children: "儿童", pregnancy: "怀孕", senior: "65 岁以上或残障" },
      yourIncome: (a) => `您的收入：每月 ${a}`,
      limitFor: (size, a) => `${size} 人家庭的上限：每月 ${a}`,
      upTo: (a) => `最多 ${a}`,
      notes: {
        pregnantCounts: "申请 Medi-Cal 和 WIC 时，孕妇算作两个人。我们已经帮您把宝宝算进去了。",
        kidsAnyStatus: "19 岁以下的儿童只要符合收入规定，不论移民身份都可以获得全面的 Medi-Cal。",
        seniorRules: "65 岁以上或有残障的人适用不同的规定。县政府也会看存款。",
        wicAuto: "因为家里有人领 Medi-Cal、CalFresh 或 CalWORKs，您家已符合 WIC 的收入规定。",
        wicNotInGroup: "WIC 只提供给孕妇、新手父母和 5 岁以下的儿童。",
        wicNoSsn: "WIC 不要求社会安全号码或公民身份证明。",
        eitcFile: "提交加州税表就能拿到，即使您不欠税。",
        eitcId: "报税需要社会安全号码或 ITIN。ITIN 由国税局（IRS）发放。",
        eitcYctc: (a) => `有 6 岁以下孩子的家庭，可能还可以多拿最多 ${a}（幼儿税收抵免）。`,
        eitcNoWork: "CalEITC 是针对工作赚来的钱。",
        coveredCa: "如果不能申请 Medi-Cal，Covered California 可以帮您降低保险费用：1-800-300-1506。",
        calfreshAmount: "金额取决于您的收入和房租等开支。",
      },
      nextSteps: "下一步",
      steps: {
        "medi-cal": "在 BenefitsCal.com 或打电话给县政府申请 Medi-Cal。",
        calfresh: "在 BenefitsCal.com 申请 CalFresh，或拨打 1-877-847-3663。",
        wic: "拨打 WIC 1-800-852-5770 预约。",
        caleitc: "提交加州税表来领取 CalEITC。免费报税帮助：1-800-906-9887。",
      },
      savePlan: "把这些步骤存到我的计划",
      saved: "已存到您的计划",
      getHelp: "获得免费申请帮助",
      startOver: "重新开始",
      disclaimer: "这只是估算，不是决定。只有县政府或机构在您申请后才能决定。",
    },
    ask: {
      title: "问 Costa",
      emptyTitle: "关于福利，什么都可以问",
      emptyBody: "打字，或点麦克风用您的语言说话。",
      micStart: "点一下说话",
      micStop: "正在听…点一下停止",
      transcribing: "正在记下您的话…",
      micError: "Costa 没听清楚。请再试一次，或打字提问。",
      micBlocked: "请在浏览器设置中允许使用麦克风，才能和 Costa 说话。",
      newChat: "新对话",
      talkToPerson: "和真人交谈",
      talkToPersonMessage: "我想和真人交谈。",
    },
    help: {
      title: "您附近的免费帮助",
      intro: "免费帮助申请福利的可靠机构。您可以要求翻译。",
      whereLabel: "您的城市或邮编",
      wherePlaceholder: "例如：Half Moon Bay 或 95020",
      search: "搜索",
      showingFor: { "san-mateo": "San Mateo 县的帮助", "santa-clara": "Santa Clara 县的帮助" },
      outside: "Costa 只列出 San Mateo 县和 Santa Clara 县的本地办公室。以下电话在全加州都可以使用。",
      localTitle: "您附近",
      statewideTitle: "全加州电话热线",
      kinds: { county: "县政府办公室", state: "州政府热线", legal: "免费法律帮助", community: "社区机构", federal: "联邦项目" },
      interpreters: "免费翻译：请说出您的语言",
      speaks: (l) => `工作人员会说${l}`,
      personTitle: "请真人联系您",
      personBody: "本地帮助人员可以免费用您的语言给您回电话或发短信。",
      topicLabel: "您需要哪方面的帮助？",
      topicOptions: { "medi-cal": "Medi-Cal", calfresh: "CalFresh（食物）", wic: "WIC", caleitc: "报税和 CalEITC", disaster: "灾害援助", other: "其他" },
      noteLabel: "还有什么需要他们知道的吗？（可不填）",
      notePlaceholder: "例如：我的续保表格下周到期",
      includeCheckup: "分享我的查询结果（不含姓名或号码）",
      partners: "合作机构入口",
    },
    letter: { saveDeadline: "存到我的截止日期", deadlineSaved: "已存到您的截止日期", reminderTitle: "信件截止日期" },
    languageNames: { en: "英语", es: "西班牙语", zh: "中文", tl: "他加禄语", vi: "越南语" },
  },

  tl: {
    nav: { home: "Home", ask: "Magtanong", check: "Suriin", letter: "Sulat", help: "Tulong" },
    common: {
      back: "Bumalik",
      next: "Susunod",
      yes: "Oo",
      no: "Hindi",
      notSure: "Hindi sigurado",
      call: "Tumawag",
      website: "Website",
      map: "Mapa",
      close: "Isara",
      save: "I-save",
      remove: "Alisin",
      language: "Wika",
      chooseLanguage: "Piliin ang iyong wika",
      listen: "Pakinggan",
      stop: "Itigil",
      stepOf: (n, total) => `Hakbang ${n} sa ${total}`,
      stayPrivate: "Nasa teleponong ito lang ang mga sagot mo.",
      emergency: "Sa emergency, tumawag sa 911.",
    },
    privacy: {
      title: "Ang iyong privacy",
      body: "Hindi kailanman nagtatanong si Costa tungkol sa immigration status. Ang plano, paalala, at sagot mo sa checkup ay naka-save lang sa teleponong ito. Binubura ang mga chat sa server namin pagkalipas ng 30 araw.",
      deleteButton: "Burahin lahat sa teleponong ito",
      confirm: "Burahin ang chat, plano, at mga paalala mo sa teleponong ito?",
      done: "Nabura na.",
    },
    home: {
      greeting: "Kumusta! Paano ka matutulungan ni Costa ngayon?",
      askCta: "Magtanong…",
      talkCta: "Magsalita",
      topicsTitle: "Saan mo kailangan ng tulong?",
      topics: {
        health: { title: "Kalusugan", sub: "Medi-Cal" },
        food: { title: "Pagkain", sub: "CalFresh, WIC" },
        money: { title: "Pera mula sa tax", sub: "Tax credit" },
        letter: { title: "Isang sulat", sub: "Kunan ng litrato" },
        disaster: { title: "Sunog, baha, brownout", sub: "Tulong sa sakuna" },
        person: { title: "Totoong tao", sub: "Libreng lokal na tulong" },
      },
      checkTitle: "Tingnan kung ano ang puwedeng makuha ng pamilya mo",
      checkBody: "5 mabilis na tanong. Mga 2 minuto. Walang pangalan o ID number.",
      checkCta: "Simulan ang checkup",
      planTitle: "Aking plano",
      planEmpty: "Dito lalabas ang mga hakbang at deadline na ise-save mo.",
      stepsProgress: (done, total) => `${done} sa ${total} tapos na`,
      remindersTitle: "Mga deadline",
      addReminder: "Magdagdag ng deadline",
      reminderWhat: "Ano ang kailangang ipasa?",
      reminderWhatPlaceholder: "Halimbawa: renewal form ng Medi-Cal",
      reminderWhen: "Petsa ng deadline",
      addToCalendar: "Idagdag sa kalendaryo",
      reachTitle: "Mas gusto mong tumawag o mag-text?",
    },
    topics: {
      health: { title: "Kalusugan (Medi-Cal)", intro: "Ang Medi-Cal ay libre o murang health insurance. Humingi ng tulong sa pag-apply, pag-renew, o pag-ayos ng problema." },
      food: { title: "Tulong sa pagkain", intro: "Nagbibigay ang CalFresh ng pera para sa pagkain bawat buwan. Nagbibigay ang WIC ng masustansyang pagkain sa mga buntis, bagong magulang, at maliliit na bata." },
      money: { title: "Pera pabalik sa tax time", intro: "Puwedeng makakuha ng pera mula sa California ang mga pamilyang nagtatrabaho kapag nag-file ng tax, kahit may ITIN lang." },
      disaster: { title: "Pagkatapos ng sunog, baha, o brownout", intro: "Tulong para mapalitan ang pagkain, makahanap ng matutuluyan, at makabangon pagkatapos ng sakuna." },
      questions: "Mga karaniwang tanong",
      actions: "Ang puwede mong gawin",
      doCheck: "Tingnan ang puwede mong makuha",
      doLetter: "Ipaliwanag ang isang sulat",
      doHelp: "Maghanap ng libreng tulong sa malapit",
      doAsk: "Magtanong ng iba",
      sourcesTitle: "Mga opisyal na source",
    },
    check: {
      title: "Benefits checkup",
      intro: "Sagutin ang ilang tanong para makita kung aling mga programa ang puwedeng makuha ng pamilya mo.",
      promises: ["Hindi kami nagtatanong tungkol sa immigration status.", "Walang pangalan, walang Social Security number.", "Nasa teleponong ito lang ang mga sagot mo."],
      start: "Simulan",
      county: {
        q: "Saan ka nakatira?",
        sanMateo: "San Mateo County",
        sanMateoHint: "Half Moon Bay, Pescadero, Redwood City, East Palo Alto…",
        santaClara: "Santa Clara County",
        santaClaraHint: "San José, Gilroy, Morgan Hill, Sunnyvale…",
        other: "Ibang lugar sa California",
      },
      size: { q: "Ilang tao ang kasama mo sa bahay at kasalo sa pagkain?", hint: "Isama ang sarili mo, mga anak mo, at sinumang kasabay mong bumili at magluto ng pagkain." },
      who: {
        q: "May tao ba sa bahay mo na ganito?",
        hint: "Piliin lahat ng tugma.",
        pregnant: "May buntis",
        baby: "May baby na wala pang 1 taon",
        young: "May batang 1 hanggang 5 taon",
        kid: "May batang 6 hanggang 18 taon",
        senior: "May 65 taong gulang pataas",
        disability: "May taong may kapansanan",
        none: "Wala sa mga ito",
      },
      kids: { q: "Ilang batang wala pang 19 taon ang kasama mo sa bahay?" },
      income: {
        q: "Mga magkano ang kinikita ng pamilya mo bago ang tax?",
        hint: "Pagsamahin ang sahod ng lahat, kasama ang trabaho sa bukid o seasonal. Ayos lang ang tantya.",
        amount: "Halaga sa dolyar",
        week: "Bawat linggo",
        twoWeeks: "Bawat 2 linggo",
        month: "Bawat buwan",
        year: "Bawat taon (seasonal na trabaho)",
        none: "Walang kita ngayon",
      },
      work: { q: "Galing ba sa trabaho ang karamihan ng perang ito?", hint: "Kasama sa trabaho ang bukid, paglilinis, day labor, o sariling maliit na negosyo." },
      benefits: { q: "May tao ba sa bahay mo na may Medi-Cal, CalFresh, o CalWORKs na?" },
      seeResults: "Tingnan ang resulta",
      resultsTitle: "Ang puwedeng makuha ng pamilya mo",
      resultsIntro: "Batay sa mga sagot mo. I-tap ang programa para makita kung bakit at ano ang susunod.",
      status: { likely: "Malaki ang tsansa", possibly: "Sulit mag-apply", unlikely: "Malamang hindi dahil sa kita", "need-more-info": "Kailangan ng dagdag na impormasyon" },
      programs: {
        "medi-cal": { name: "Medi-Cal", what: "Libre o murang pagpapagamot" },
        calfresh: { name: "CalFresh", what: "Pera para sa pagkain bawat buwan" },
        wic: { name: "WIC", what: "Masustansyang pagkain para sa nanay, baby, at batang wala pang 5" },
        caleitc: { name: "CalEITC", what: "Pera pabalik kapag nag-file ng tax" },
      },
      groups: { adults: "Matatanda", children: "Mga bata", pregnancy: "Pagbubuntis", senior: "65+ o may kapansanan" },
      yourIncome: (a) => `Kita mo: ${a} bawat buwan`,
      limitFor: (size, a) => `Limit para sa ${size} tao: ${a} bawat buwan`,
      upTo: (a) => `Hanggang ${a}`,
      notes: {
        pregnantCounts: "Sa Medi-Cal at WIC, dalawang tao ang bilang sa buntis. Isinama na namin ang baby.",
        kidsAnyStatus: "Ang mga batang wala pang 19 taon ay puwedeng makakuha ng buong Medi-Cal anuman ang immigration status, kung pasok sila sa income rules.",
        seniorRules: "Iba ang rules para sa 65 taon pataas o may kapansanan. Tinitingnan din ng county ang ipon.",
        wicAuto: "Dahil may nakakakuha ng Medi-Cal, CalFresh, o CalWORKs, pasok na ang pamilya mo sa income rule ng WIC.",
        wicNotInGroup: "Ang WIC ay para lang sa mga buntis, bagong magulang, at batang wala pang 5 taon.",
        wicNoSsn: "Hindi humihingi ang WIC ng Social Security number o patunay ng citizenship.",
        eitcFile: "Makukuha ito kapag nag-file ka ng California tax return, kahit wala kang utang na tax.",
        eitcId: "Kailangan mo ng Social Security number o ITIN para mag-file. Ang IRS ang nagbibigay ng ITIN.",
        eitcYctc: (a) => `Ang mga pamilyang may batang wala pang 6 taon ay puwede pang makakuha ng hanggang ${a} (Young Child Tax Credit).`,
        eitcNoWork: "Ang CalEITC ay para sa perang kinita sa trabaho.",
        coveredCa: "Kung hindi puwede ang Medi-Cal, makakatulong ang Covered California na pababain ang gastos sa health insurance: 1-800-300-1506.",
        calfreshAmount: "Ang halaga ay depende sa kita mo at mga gastos tulad ng upa.",
      },
      nextSteps: "Ano ang susunod",
      steps: {
        "medi-cal": "Mag-apply sa Medi-Cal sa BenefitsCal.com o tumawag sa county mo.",
        calfresh: "Mag-apply sa CalFresh sa BenefitsCal.com o tumawag sa 1-877-847-3663.",
        wic: "Tumawag sa WIC sa 1-800-852-5770 para magpa-appointment.",
        caleitc: "Mag-file ng California tax return para makuha ang CalEITC. Libreng tulong sa tax: 1-800-906-9887.",
      },
      savePlan: "I-save ang mga hakbang na ito sa plano ko",
      saved: "Naka-save sa plano mo",
      getHelp: "Humingi ng libreng tulong sa pag-apply",
      startOver: "Magsimula ulit",
      disclaimer: "Tantya lang ito, hindi desisyon. Ang county o ahensya lang ang makakapagpasya, pagkatapos mong mag-apply.",
    },
    ask: {
      title: "Magtanong kay Costa",
      emptyTitle: "Magtanong ng kahit ano tungkol sa benepisyo",
      emptyBody: "Mag-type, o i-tap ang mikropono at magsalita sa iyong wika.",
      micStart: "I-tap para magsalita",
      micStop: "Nakikinig… i-tap para huminto",
      transcribing: "Isinusulat ang mga sinabi mo…",
      micError: "Hindi ka narinig ni Costa. Subukan ulit, o i-type ang tanong mo.",
      micBlocked: "Payagan ang mikropono sa settings ng browser para makausap si Costa.",
      newChat: "Bagong chat",
      talkToPerson: "Makipag-usap sa tao",
      talkToPersonMessage: "Gusto kong makipag-usap sa totoong tao.",
    },
    help: {
      title: "Libreng tulong malapit sa iyo",
      intro: "Mga mapagkakatiwalaang lugar na tumutulong sa benepisyo nang libre. Puwede kang humingi ng interpreter.",
      whereLabel: "Iyong lungsod o ZIP code",
      wherePlaceholder: "Halimbawa: Half Moon Bay o 95020",
      search: "Hanapin",
      showingFor: { "san-mateo": "Tulong sa San Mateo County", "santa-clara": "Tulong sa Santa Clara County" },
      outside: "Mga lokal na opisina sa San Mateo at Santa Clara County lang ang nakalista kay Costa. Ang mga linyang ito ay tumutulong kahit saan sa California.",
      localTitle: "Malapit sa iyo",
      statewideTitle: "Mga linya para sa buong California",
      kinds: { county: "Opisina ng county", state: "Linya ng estado", legal: "Libreng tulong legal", community: "Organisasyon sa komunidad", federal: "Pederal na programa" },
      interpreters: "Libreng interpreter: hingin ang iyong wika",
      speaks: (l) => `Marunong ang staff ng ${l}`,
      personTitle: "Humiling na kontakin ka ng isang tao",
      personBody: "Puwede kang tawagan o i-text ng lokal na tagatulong sa iyong wika, nang libre.",
      topicLabel: "Saan mo kailangan ng tulong?",
      topicOptions: { "medi-cal": "Medi-Cal", calfresh: "CalFresh (pagkain)", wic: "WIC", caleitc: "Tax at CalEITC", disaster: "Tulong sa sakuna", other: "Iba pa" },
      noteLabel: "May dapat ba silang malaman? (opsyonal)",
      notePlaceholder: "Halimbawa: sa susunod na linggo ang deadline ng renewal ko",
      includeCheckup: "Ibahagi ang resulta ng checkup ko (walang pangalan o numero)",
      partners: "Para sa mga partner na organisasyon",
    },
    letter: { saveDeadline: "I-save sa mga deadline ko", deadlineSaved: "Naka-save sa mga deadline mo", reminderTitle: "Deadline ng sulat" },
    languageNames: { en: "English", es: "Spanish", zh: "Chinese", tl: "Tagalog", vi: "Vietnamese" },
  },

  vi: {
    nav: { home: "Trang chủ", ask: "Hỏi", check: "Kiểm tra", letter: "Thư", help: "Trợ giúp" },
    common: {
      back: "Quay lại",
      next: "Tiếp",
      yes: "Có",
      no: "Không",
      notSure: "Không chắc",
      call: "Gọi",
      website: "Trang web",
      map: "Bản đồ",
      close: "Đóng",
      save: "Lưu",
      remove: "Xóa",
      language: "Ngôn ngữ",
      chooseLanguage: "Chọn ngôn ngữ của bạn",
      listen: "Nghe",
      stop: "Dừng",
      stepOf: (n, total) => `Bước ${n}/${total}`,
      stayPrivate: "Câu trả lời của bạn chỉ lưu trên điện thoại này.",
      emergency: "Trường hợp khẩn cấp, hãy gọi 911.",
    },
    privacy: {
      title: "Quyền riêng tư của bạn",
      body: "Costa không bao giờ hỏi về tình trạng di trú. Kế hoạch, lời nhắc và câu trả lời của bạn chỉ lưu trên điện thoại này. Tin nhắn trò chuyện được xóa khỏi máy chủ sau 30 ngày.",
      deleteButton: "Xóa hết trên điện thoại này",
      confirm: "Xóa cuộc trò chuyện, kế hoạch và lời nhắc khỏi điện thoại này?",
      done: "Đã xóa.",
    },
    home: {
      greeting: "Xin chào! Hôm nay Costa có thể giúp gì cho bạn?",
      askCta: "Đặt câu hỏi…",
      talkCta: "Nói",
      topicsTitle: "Bạn cần giúp về việc gì?",
      topics: {
        health: { title: "Chăm sóc sức khỏe", sub: "Medi-Cal" },
        food: { title: "Thực phẩm", sub: "CalFresh, WIC" },
        money: { title: "Tiền hoàn thuế", sub: "Tín thuế" },
        letter: { title: "Một lá thư", sub: "Chụp ảnh" },
        disaster: { title: "Cháy, lụt, mất điện", sub: "Trợ giúp thiên tai" },
        person: { title: "Người thật", sub: "Trợ giúp địa phương miễn phí" },
      },
      checkTitle: "Xem gia đình bạn có thể nhận gì",
      checkBody: "5 câu hỏi nhanh. Khoảng 2 phút. Không cần tên hay số giấy tờ.",
      checkCta: "Bắt đầu kiểm tra",
      planTitle: "Kế hoạch của tôi",
      planEmpty: "Các bước và hạn chót bạn lưu sẽ hiện ở đây.",
      stepsProgress: (done, total) => `Xong ${done}/${total}`,
      remindersTitle: "Hạn chót",
      addReminder: "Thêm hạn chót",
      reminderWhat: "Cần nộp gì?",
      reminderWhatPlaceholder: "Ví dụ: mẫu gia hạn Medi-Cal",
      reminderWhen: "Ngày hạn chót",
      addToCalendar: "Thêm vào lịch",
      reachTitle: "Bạn muốn gọi hoặc nhắn tin?",
    },
    topics: {
      health: { title: "Sức khỏe (Medi-Cal)", intro: "Medi-Cal là bảo hiểm sức khỏe miễn phí hoặc chi phí thấp. Nhận trợ giúp để đăng ký, gia hạn hoặc giải quyết vấn đề." },
      food: { title: "Trợ giúp thực phẩm", intro: "CalFresh cấp tiền mua thực phẩm mỗi tháng. WIC cung cấp thực phẩm lành mạnh cho người mang thai, cha mẹ mới sinh con và trẻ nhỏ." },
      money: { title: "Nhận tiền khi khai thuế", intro: "Gia đình đi làm có thể nhận tiền từ California khi khai thuế, kể cả khi dùng ITIN." },
      disaster: { title: "Sau cháy, lụt hoặc mất điện", intro: "Trợ giúp để bù lại thực phẩm, tìm chỗ ở và phục hồi sau thiên tai." },
      questions: "Câu hỏi thường gặp",
      actions: "Bạn có thể làm gì",
      doCheck: "Kiểm tra bạn có thể nhận gì",
      doLetter: "Giải thích một lá thư",
      doHelp: "Tìm trợ giúp miễn phí gần bạn",
      doAsk: "Hỏi câu khác",
      sourcesTitle: "Nguồn chính thức",
    },
    check: {
      title: "Kiểm tra phúc lợi",
      intro: "Trả lời vài câu hỏi để xem gia đình bạn có thể nhận những chương trình nào.",
      promises: ["Chúng tôi không bao giờ hỏi về tình trạng di trú.", "Không cần tên, không cần số An Sinh Xã Hội.", "Câu trả lời của bạn chỉ lưu trên điện thoại này."],
      start: "Bắt đầu",
      county: {
        q: "Bạn sống ở đâu?",
        sanMateo: "Quận San Mateo",
        sanMateoHint: "Half Moon Bay, Pescadero, Redwood City, East Palo Alto…",
        santaClara: "Quận Santa Clara",
        santaClaraHint: "San José, Gilroy, Morgan Hill, Sunnyvale…",
        other: "Nơi khác ở California",
      },
      size: { q: "Có bao nhiêu người sống cùng bạn và ăn chung?", hint: "Tính cả bạn, con của bạn và những người cùng mua và nấu ăn với bạn." },
      who: {
        q: "Trong nhà có ai thuộc các trường hợp này không?",
        hint: "Chọn tất cả những gì đúng.",
        pregnant: "Có người đang mang thai",
        baby: "Có em bé dưới 1 tuổi",
        young: "Có trẻ từ 1 đến 5 tuổi",
        kid: "Có trẻ từ 6 đến 18 tuổi",
        senior: "Có người từ 65 tuổi trở lên",
        disability: "Có người khuyết tật",
        none: "Không có ai",
      },
      kids: { q: "Có bao nhiêu trẻ dưới 19 tuổi sống cùng bạn?" },
      income: {
        q: "Gia đình bạn kiếm được khoảng bao nhiêu trước thuế?",
        hint: "Cộng tiền lương của mọi người, kể cả làm nông hoặc làm theo mùa. Ước chừng là được.",
        amount: "Số tiền (đô la)",
        week: "Mỗi tuần",
        twoWeeks: "Mỗi 2 tuần",
        month: "Mỗi tháng",
        year: "Mỗi năm (làm theo mùa)",
        none: "Hiện không có thu nhập",
      },
      work: { q: "Phần lớn số tiền này có phải từ đi làm không?", hint: "Đi làm gồm làm nông, dọn dẹp, làm công nhật hoặc tự kinh doanh nhỏ." },
      benefits: { q: "Trong nhà có ai đang nhận Medi-Cal, CalFresh hoặc CalWORKs không?" },
      seeResults: "Xem kết quả",
      resultsTitle: "Những gì gia đình bạn có thể nhận",
      resultsIntro: "Dựa trên câu trả lời của bạn. Chạm vào chương trình để xem lý do và việc cần làm.",
      status: { likely: "Nhiều khả năng", possibly: "Nên nộp đơn", unlikely: "Có lẽ không do thu nhập", "need-more-info": "Cần thêm thông tin" },
      programs: {
        "medi-cal": { name: "Medi-Cal", what: "Chăm sóc sức khỏe miễn phí hoặc chi phí thấp" },
        calfresh: { name: "CalFresh", what: "Tiền mua thực phẩm mỗi tháng" },
        wic: { name: "WIC", what: "Thực phẩm lành mạnh cho mẹ, em bé và trẻ dưới 5 tuổi" },
        caleitc: { name: "CalEITC", what: "Tiền hoàn lại khi khai thuế" },
      },
      groups: { adults: "Người lớn", children: "Trẻ em", pregnancy: "Mang thai", senior: "65+ hoặc khuyết tật" },
      yourIncome: (a) => `Thu nhập của bạn: ${a} mỗi tháng`,
      limitFor: (size, a) => `Giới hạn cho ${size} người: ${a} mỗi tháng`,
      upTo: (a) => `Tối đa ${a}`,
      notes: {
        pregnantCounts: "Với Medi-Cal và WIC, người mang thai được tính là hai người. Chúng tôi đã tính thêm em bé.",
        kidsAnyStatus: "Trẻ em dưới 19 tuổi có thể nhận Medi-Cal đầy đủ bất kể tình trạng di trú, nếu đáp ứng quy định về thu nhập.",
        seniorRules: "Người từ 65 tuổi hoặc khuyết tật có quy định khác. Quận cũng xem xét tiền tiết kiệm.",
        wicAuto: "Vì có người nhận Medi-Cal, CalFresh hoặc CalWORKs, gia đình bạn đáp ứng quy định thu nhập của WIC.",
        wicNotInGroup: "WIC chỉ dành cho người mang thai, cha mẹ mới sinh con và trẻ dưới 5 tuổi.",
        wicNoSsn: "WIC không yêu cầu số An Sinh Xã Hội hay giấy tờ chứng minh quốc tịch.",
        eitcFile: "Bạn nhận được khi nộp tờ khai thuế California, dù không nợ thuế.",
        eitcId: "Bạn cần số An Sinh Xã Hội hoặc ITIN để khai thuế. Sở Thuế (IRS) cấp số ITIN.",
        eitcYctc: (a) => `Gia đình có trẻ dưới 6 tuổi có thể nhận thêm tối đa ${a} (Tín Thuế Trẻ Nhỏ).`,
        eitcNoWork: "CalEITC dành cho tiền kiếm được từ đi làm.",
        coveredCa: "Nếu không thể nhận Medi-Cal, Covered California có thể giúp giảm chi phí bảo hiểm: 1-800-300-1506.",
        calfreshAmount: "Số tiền tùy vào thu nhập và chi phí như tiền thuê nhà.",
      },
      nextSteps: "Việc cần làm tiếp",
      steps: {
        "medi-cal": "Đăng ký Medi-Cal tại BenefitsCal.com hoặc gọi cho quận.",
        calfresh: "Đăng ký CalFresh tại BenefitsCal.com hoặc gọi 1-877-847-3663.",
        wic: "Gọi WIC số 1-800-852-5770 để lấy hẹn.",
        caleitc: "Nộp tờ khai thuế California để nhận CalEITC. Trợ giúp khai thuế miễn phí: 1-800-906-9887.",
      },
      savePlan: "Lưu các bước này vào kế hoạch",
      saved: "Đã lưu vào kế hoạch",
      getHelp: "Nhận trợ giúp nộp đơn miễn phí",
      startOver: "Làm lại từ đầu",
      disclaimer: "Đây là ước tính, không phải quyết định. Chỉ quận hoặc cơ quan mới quyết định, sau khi bạn nộp đơn.",
    },
    ask: {
      title: "Hỏi Costa",
      emptyTitle: "Hỏi bất cứ điều gì về phúc lợi",
      emptyBody: "Gõ chữ, hoặc chạm vào micrô và nói bằng ngôn ngữ của bạn.",
      micStart: "Chạm để nói",
      micStop: "Đang nghe… chạm để dừng",
      transcribing: "Đang ghi lại lời bạn nói…",
      micError: "Costa nghe không rõ. Hãy thử lại hoặc gõ câu hỏi.",
      micBlocked: "Hãy cho phép micrô trong cài đặt trình duyệt để nói chuyện với Costa.",
      newChat: "Trò chuyện mới",
      talkToPerson: "Nói chuyện với người thật",
      talkToPersonMessage: "Tôi muốn nói chuyện với người thật.",
    },
    help: {
      title: "Trợ giúp miễn phí gần bạn",
      intro: "Những nơi đáng tin cậy giúp về phúc lợi miễn phí. Bạn có thể yêu cầu thông dịch viên.",
      whereLabel: "Thành phố hoặc mã ZIP của bạn",
      wherePlaceholder: "Ví dụ: Half Moon Bay hoặc 95020",
      search: "Tìm",
      showingFor: { "san-mateo": "Trợ giúp tại Quận San Mateo", "santa-clara": "Trợ giúp tại Quận Santa Clara" },
      outside: "Costa chỉ liệt kê văn phòng địa phương ở Quận San Mateo và Santa Clara. Các đường dây này giúp ở mọi nơi tại California.",
      localTitle: "Gần bạn",
      statewideTitle: "Đường dây cho toàn California",
      kinds: { county: "Văn phòng quận", state: "Đường dây tiểu bang", legal: "Trợ giúp pháp lý miễn phí", community: "Tổ chức cộng đồng", federal: "Chương trình liên bang" },
      interpreters: "Thông dịch miễn phí: hãy nói ngôn ngữ của bạn",
      speaks: (l) => `Nhân viên nói ${l}`,
      personTitle: "Nhờ một người liên hệ với bạn",
      personBody: "Nhân viên hỗ trợ địa phương có thể gọi lại hoặc nhắn tin bằng ngôn ngữ của bạn, miễn phí.",
      topicLabel: "Bạn cần giúp về việc gì?",
      topicOptions: { "medi-cal": "Medi-Cal", calfresh: "CalFresh (thực phẩm)", wic: "WIC", caleitc: "Thuế và CalEITC", disaster: "Trợ giúp thiên tai", other: "Việc khác" },
      noteLabel: "Có điều gì họ nên biết không? (không bắt buộc)",
      notePlaceholder: "Ví dụ: hạn gia hạn của tôi là tuần sau",
      includeCheckup: "Chia sẻ kết quả kiểm tra (không có tên hay số)",
      partners: "Dành cho tổ chức đối tác",
    },
    letter: { saveDeadline: "Lưu vào hạn chót của tôi", deadlineSaved: "Đã lưu vào hạn chót", reminderTitle: "Hạn chót của thư" },
    languageNames: { en: "tiếng Anh", es: "tiếng Tây Ban Nha", zh: "tiếng Trung", tl: "tiếng Tagalog", vi: "tiếng Việt" },
  },
};
