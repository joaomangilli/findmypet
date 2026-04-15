import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SubscribePage from "@/app/subscribe/page";
import { api } from "@/lib/api";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/lib/api", () => ({
  api: { subscribe: jest.fn() },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("SubscribePage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the subscription form", () => {
    render(<SubscribePage />);
    expect(screen.getByPlaceholderText("Nome completo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\+55/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Rua, bairro/)).toBeInTheDocument();
    expect(screen.getByText(/Quero receber alertas/)).toBeInTheDocument();
  });

  it("shows success screen after successful submission", async () => {
    mockedApi.subscribe.mockResolvedValueOnce({
      id: 1, phone: "+5511999000001", name: "Carlos",
      address: "Rua A", notification_radius_km: 5,
    });

    render(<SubscribePage />);

    await userEvent.type(screen.getByPlaceholderText("Nome completo"), "Carlos");
    await userEvent.type(screen.getByPlaceholderText(/\+55/), "+5511999000001");
    await userEvent.type(screen.getByPlaceholderText(/Rua, bairro/), "Rua A, 100");

    fireEvent.click(screen.getByText(/Quero receber alertas/));

    await waitFor(() => {
      expect(screen.getByText("Pronto!")).toBeInTheDocument();
    });
  });

  it("shows error when subscribe fails", async () => {
    mockedApi.subscribe.mockRejectedValueOnce(new Error("Telefone já cadastrado"));
    render(<SubscribePage />);

    await userEvent.type(screen.getByPlaceholderText("Nome completo"), "Carlos");
    await userEvent.type(screen.getByPlaceholderText(/\+55/), "+5511999000001");
    await userEvent.type(screen.getByPlaceholderText(/Rua, bairro/), "Rua A");

    fireEvent.click(screen.getByText(/Quero receber alertas/));

    await waitFor(() => {
      expect(screen.getByText("Telefone já cadastrado")).toBeInTheDocument();
    });
  });

  it("calls subscribe with correct payload", async () => {
    mockedApi.subscribe.mockResolvedValueOnce({
      id: 1, phone: "+5511999000001", name: "Carlos",
      address: "Rua A", notification_radius_km: 5,
    });

    render(<SubscribePage />);

    await userEvent.type(screen.getByPlaceholderText("Nome completo"), "Carlos");
    await userEvent.type(screen.getByPlaceholderText(/\+55/), "+5511999000001");
    await userEvent.type(screen.getByPlaceholderText(/Rua, bairro/), "Rua A");

    fireEvent.click(screen.getByText(/Quero receber alertas/));

    await waitFor(() => {
      expect(mockedApi.subscribe).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Carlos", phone: "+5511999000001" })
      );
    });
  });
});
