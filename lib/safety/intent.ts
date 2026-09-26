const HUMAN_PATTERNS: RegExp[] = [
  // English
  /\b(talk|speak|chat)\s+(to|with)\s+(a\s+)?(real\s+|live\s+)?(person|human|someone|somebody|agent|representative|caseworker|worker)\b/i,
  /\b(real|live)\s+(person|human)\b/i,
  /\b(human|representative|caseworker)\b.*\b(please|help)\b/i,
  /\bcall\s+me\s+back\b/i,
  // Spanish
  /\bhablar\s+con\s+(una\s+persona|un\s+humano|alguien|un\s+representante|un[a]?\s+trabajador[a]?|un\s+agente)\b/i,
  /\bpersona\s+real\b/i,
  /\bque\s+me\s+llamen\b/i,
  // Mandarin
  /人工|真人|和人(说|講|讲)话|跟人(说|讲)|找人帮|工作人员|客服/,
  // Tagalog
  /\b(makausap|kausapin|makipag-usap)\b.*\b(tao|tauhan|kinatawan|someone)\b/i,
  /\btotoong\s+tao\b/i,
  // Vietnamese
  /nói chuyện với (một )?(người|nhân viên)/i,
  /người thật/i,
];

export function wantsHuman(text: string): boolean {
  return HUMAN_PATTERNS.some((p) => p.test(text));
}
