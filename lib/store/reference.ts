const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function makeReference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  let out = "C-";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}
