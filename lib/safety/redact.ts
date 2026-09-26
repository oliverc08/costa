export type RedactionKind = "ssn-or-itin" | "medi-cal-id" | "card-number";

export interface RedactionResult {
  text: string;
  redacted: boolean;
  kinds: RedactionKind[];
}

export const REDACTED = "[REDACTED]";

const SSN = /(?<![\d-])\d{3}([-\s.]?)\d{2}\1\d{4}(?![\d-])/g;
const BIC = /\b\d{8}[A-Za-z]\d{5}\b/g;
const CIN = /\b9\d{7}[A-Za-z]\b/g;
const CARD = /(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)/g;

function luhn(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/**
 * Removes Social Security numbers, ITINs, Medi-Cal ID numbers, and payment card
 * numbers. Runs before any text reaches the model or storage.
 */
export function redact(input: string): RedactionResult {
  const kinds = new Set<RedactionKind>();
  let text = input;

  text = text.replace(CARD, (m) => {
    const digits = m.replace(/\D/g, "");
    if (digits.length >= 13 && digits.length <= 19 && luhn(digits)) {
      kinds.add("card-number");
      return REDACTED;
    }
    return m;
  });
  text = text.replace(BIC, () => {
    kinds.add("medi-cal-id");
    return REDACTED;
  });
  text = text.replace(CIN, () => {
    kinds.add("medi-cal-id");
    return REDACTED;
  });
  text = text.replace(SSN, () => {
    kinds.add("ssn-or-itin");
    return REDACTED;
  });

  return { text, redacted: kinds.size > 0, kinds: [...kinds] };
}
