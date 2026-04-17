// Normaliza o número removendo espaços, traços e parênteses,
// e garante o prefixo +55 se ausente.
export function normalizePhone(raw: string): string {
  // Remove tudo exceto dígitos e o + inicial
  let digits = raw.replace(/[^\d+]/g, "");

  // Se começa com 55 (sem +), adiciona +
  if (/^55\d/.test(digits)) {
    digits = "+" + digits;
  }

  // Se começa com 0 (discagem local antiga), remove
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Se não tem código de país, assume Brasil (+55)
  if (/^\d{10,11}$/.test(digits)) {
    digits = "+55" + digits;
  }

  return digits;
}

// Valida celular brasileiro: +55 + DDD (2 dígitos) + 9XXXXXXXX (9 dígitos)
// Exemplos válidos: +5511999990000, +5521987654321
const BR_MOBILE_RE = /^\+55[1-9]{1}[1-9]\d{9}$/;

export function isValidBrazilianPhone(raw: string): boolean {
  return BR_MOBILE_RE.test(normalizePhone(raw));
}

export const PHONE_ERROR =
  "Informe um celular brasileiro válido (+55 DDD 9XXXX-XXXX)";
