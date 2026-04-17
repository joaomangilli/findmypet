import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SubscribePage from "@/app/subscribe/page";
import { api } from "@/lib/api";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/lib/api", () => ({
  api: { subscribe: jest.fn() },
}));

// MapView mock: renderiza um botão que dispara onLocationSelect com coordenadas fixas
jest.mock("@/components/MapView", () => ({
  __esModule: true,
  default: ({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) => (
    <button
      data-testid="map-select"
      onClick={() => onLocationSelect?.(-23.548, -46.633)}
    >
      Selecionar no mapa
    </button>
  ),
}));

const mockedApi = api as jest.Mocked<typeof api>;

async function fillAndSelectLocation() {
  await userEvent.type(screen.getByPlaceholderText("Nome completo"), "Carlos");
  await userEvent.type(screen.getByPlaceholderText(/\+55/), "+5511999000001");
  await userEvent.type(screen.getByPlaceholderText(/Rua, bairro/), "Rua A, 100");
  fireEvent.click(screen.getByTestId("map-select"));
}

describe("SubscribePage", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the subscription form", () => {
    render(<SubscribePage />);
    expect(screen.getByPlaceholderText("Nome completo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\+55/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Rua, bairro/)).toBeInTheDocument();
    expect(screen.getByText(/Quero receber alertas/)).toBeInTheDocument();
  });

  it("shows error when submitting without selecting location on map", async () => {
    render(<SubscribePage />);

    await userEvent.type(screen.getByPlaceholderText("Nome completo"), "Carlos");
    await userEvent.type(screen.getByPlaceholderText(/\+55/), "+5511999000001");
    await userEvent.type(screen.getByPlaceholderText(/Rua, bairro/), "Rua A");

    fireEvent.click(screen.getByText(/Quero receber alertas/));

    await waitFor(() => {
      expect(screen.getByText(/Clique no mapa para marcar sua localização/)).toBeInTheDocument();
    });
    expect(mockedApi.subscribe).not.toHaveBeenCalled();
  });

  it("shows location confirmation after map click", async () => {
    render(<SubscribePage />);
    fireEvent.click(screen.getByTestId("map-select"));
    expect(screen.getByText(/-23/)).toBeInTheDocument();
  });

  it("shows success screen after successful submission", async () => {
    mockedApi.subscribe.mockResolvedValueOnce({
      id: 1, phone: "+5511999000001", name: "Carlos",
      address: "Rua A", notification_radius_km: 5,
    });

    render(<SubscribePage />);
    await fillAndSelectLocation();
    fireEvent.click(screen.getByText(/Quero receber alertas/));

    await waitFor(() => {
      expect(screen.getByText("Pronto!")).toBeInTheDocument();
    });
  });

  it("shows error when subscribe fails", async () => {
    mockedApi.subscribe.mockRejectedValueOnce(new Error("Telefone já cadastrado"));
    render(<SubscribePage />);

    await fillAndSelectLocation();
    fireEvent.click(screen.getByText(/Quero receber alertas/));

    await waitFor(() => {
      expect(screen.getByText("Telefone já cadastrado")).toBeInTheDocument();
    });
  });

  it("calls subscribe with lat/lng from map", async () => {
    mockedApi.subscribe.mockResolvedValueOnce({
      id: 1, phone: "+5511999000001", name: "Carlos",
      address: "Rua A", notification_radius_km: 5,
    });

    render(<SubscribePage />);
    await fillAndSelectLocation();
    fireEvent.click(screen.getByText(/Quero receber alertas/));

    await waitFor(() => {
      expect(mockedApi.subscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Carlos",
          phone: "+5511999000001",
          lat: -23.548,
          lng: -46.633,
        })
      );
    });
  });
});
