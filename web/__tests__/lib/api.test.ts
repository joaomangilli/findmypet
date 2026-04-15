import { api } from "@/lib/api";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("api", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorageMock.clear();
  });

  describe("listAnnouncements", () => {
    it("calls the correct endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await api.listAnnouncements();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/announcements"),
        expect.objectContaining({ headers: expect.any(Object) })
      );
    });

    it("returns the parsed JSON", async () => {
      const data = [{ id: 1, status: "active" }];
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });

      const result = await api.listAnnouncements();
      expect(result).toEqual(data);
    });
  });

  describe("sendOtp", () => {
    it("POSTs to auth/send_otp with phone", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ message: "ok" }) });

      await api.sendOtp("+5511999000001");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/auth/send_otp"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("error handling", () => {
    it("throws with error message from API on non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ error: "Telefone é obrigatório" }),
      });

      await expect(api.sendOtp("")).rejects.toThrow("Telefone é obrigatório");
    });

    it("includes Authorization header when token is stored", async () => {
      localStorageMock.setItem("findmypet_token", "my-jwt-token");
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

      await api.listAnnouncements();
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1].headers["Authorization"]).toBe("Bearer my-jwt-token");
    });
  });
});
