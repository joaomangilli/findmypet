import { saveAuth, clearAuth, getStoredUser, isLoggedIn } from "@/lib/auth";

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

const mockUser = { id: 1, phone: "+5511999000001", name: "Ana" };

describe("auth", () => {
  beforeEach(() => localStorageMock.clear());

  describe("saveAuth", () => {
    it("stores token and user in localStorage", () => {
      saveAuth("tok123", mockUser);
      expect(localStorageMock.getItem("findmypet_token")).toBe("tok123");
      expect(JSON.parse(localStorageMock.getItem("findmypet_user")!)).toEqual(mockUser);
    });
  });

  describe("clearAuth", () => {
    it("removes token and user from localStorage", () => {
      saveAuth("tok123", mockUser);
      clearAuth();
      expect(localStorageMock.getItem("findmypet_token")).toBeNull();
      expect(localStorageMock.getItem("findmypet_user")).toBeNull();
    });
  });

  describe("getStoredUser", () => {
    it("returns null when no user is stored", () => {
      expect(getStoredUser()).toBeNull();
    });

    it("returns the stored user", () => {
      saveAuth("tok123", mockUser);
      expect(getStoredUser()).toEqual(mockUser);
    });
  });

  describe("isLoggedIn", () => {
    it("returns false when no token", () => {
      expect(isLoggedIn()).toBe(false);
    });

    it("returns true when token exists", () => {
      saveAuth("tok123", mockUser);
      expect(isLoggedIn()).toBe(true);
    });
  });
});
