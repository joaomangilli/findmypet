import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";
import { api } from "@/lib/api";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock api
jest.mock("@/lib/api", () => ({
  api: {
    sendOtp: jest.fn(),
    verifyOtp: jest.fn(),
  },
}));

// Mock auth
jest.mock("@/lib/auth", () => ({
  saveAuth: jest.fn(),
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders phone input on first step", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText(/\+55/)).toBeInTheDocument();
    expect(screen.getByText(/Receber código/)).toBeInTheDocument();
  });

  it("moves to OTP step after sending code", async () => {
    mockedApi.sendOtp.mockResolvedValueOnce({ message: "ok" } as never);
    render(<LoginPage />);

    await userEvent.type(screen.getByPlaceholderText(/\+55/), "+5511999000001");
    fireEvent.click(screen.getByText(/Receber código/));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("123456")).toBeInTheDocument();
    });
  });

  it("shows error when sendOtp fails", async () => {
    mockedApi.sendOtp.mockRejectedValueOnce(new Error("Serviço indisponível"));
    render(<LoginPage />);

    await userEvent.type(screen.getByPlaceholderText(/\+55/), "+5511999000001");
    fireEvent.click(screen.getByText(/Receber código/));

    await waitFor(() => {
      expect(screen.getByText("Serviço indisponível")).toBeInTheDocument();
    });
  });

  it("redirects to /announcements/new after successful login", async () => {
    mockedApi.sendOtp.mockResolvedValueOnce({ message: "ok" } as never);
    mockedApi.verifyOtp.mockResolvedValueOnce({
      token: "jwt-token",
      user: { id: 1, phone: "+5511999000001", name: "Ana" },
    });

    render(<LoginPage />);

    await userEvent.type(screen.getByPlaceholderText(/\+55/), "+5511999000001");
    fireEvent.click(screen.getByText(/Receber código/));

    await waitFor(() => screen.getByPlaceholderText("123456"));
    await userEvent.type(screen.getByPlaceholderText("123456"), "123456");
    fireEvent.click(screen.getByText(/^Entrar$/));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/announcements/new");
    });
  });

  it("shows error when verifyOtp fails", async () => {
    mockedApi.sendOtp.mockResolvedValueOnce({ message: "ok" } as never);
    mockedApi.verifyOtp.mockRejectedValueOnce(new Error("Código incorreto"));

    render(<LoginPage />);

    await userEvent.type(screen.getByPlaceholderText(/\+55/), "+5511999000001");
    fireEvent.click(screen.getByText(/Receber código/));

    await waitFor(() => screen.getByPlaceholderText("123456"));
    await userEvent.type(screen.getByPlaceholderText("123456"), "000000");
    fireEvent.click(screen.getByText(/^Entrar$/));

    await waitFor(() => {
      expect(screen.getByText("Código incorreto")).toBeInTheDocument();
    });
  });
});
