import { isValidBrazilianPhone, normalizePhone } from "@/lib/phone";

describe("normalizePhone", () => {
  it("mantém número já normalizado", () => {
    expect(normalizePhone("+5511999000001")).toBe("+5511999000001");
  });

  it("remove espaços e traços", () => {
    expect(normalizePhone("+55 11 99999-0000")).toBe("+5511999990000");
  });

  it("remove parênteses", () => {
    expect(normalizePhone("+55 (11) 99999-0000")).toBe("+5511999990000");
  });

  it("adiciona +55 quando número tem 11 dígitos", () => {
    expect(normalizePhone("11999990000")).toBe("+5511999990000");
  });

  it("adiciona + quando começa com 55 sem +", () => {
    expect(normalizePhone("5511999990000")).toBe("+5511999990000");
  });
});

describe("isValidBrazilianPhone", () => {
  const valid = [
    "+5511999000001",  // SP — formato canônico
    "+5521987654321",  // RJ
    "+5531900000001",  // BH
    "+5571912345678",  // BA
    "+5585987654321",  // CE
    "11999000001",     // sem +55 → normalizePhone adiciona +55 (aceita por UX)
    "5511999000001",   // sem + → normalizePhone adiciona + (aceita por UX)
  ];

  const invalid = [
    "abc",              // letras
    "+5511999000",      // curto demais (8 dígitos após DDD)
    "+551199900000099", // longo demais
    "+551099900001",    // DDD com 0 na primeira posição
    "",                 // vazio
  ];

  valid.forEach((phone) => {
    it(`aceita ${phone}`, () => {
      expect(isValidBrazilianPhone(phone)).toBe(true);
    });
  });

  invalid.forEach((phone) => {
    it(`rejeita ${JSON.stringify(phone)}`, () => {
      expect(isValidBrazilianPhone(phone)).toBe(false);
    });
  });
});
