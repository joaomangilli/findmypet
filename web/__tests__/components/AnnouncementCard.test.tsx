import { render, screen } from "@testing-library/react";
import AnnouncementCard from "@/components/AnnouncementCard";
import type { AnnouncementSummary } from "@/lib/api";

const baseAnnouncement: AnnouncementSummary = {
  id: 1,
  status: "active",
  last_seen_address: "Rua das Flores, 100",
  last_seen_at: "2026-04-14T10:00:00Z",
  created_at: "2026-04-14T10:00:00Z",
  lat: -23.548,
  lng: -46.633,
  pet: {
    id: 1,
    name: "Rex",
    species: "dog",
    breed: "Labrador",
    color: "caramelo",
    description: "Pet dócil.",
    photos: [],
  },
  owner: { id: 1, name: "João" },
};

describe("AnnouncementCard", () => {
  it("renders pet name", () => {
    render(<AnnouncementCard a={baseAnnouncement} />);
    expect(screen.getByText("Rex")).toBeInTheDocument();
  });

  it("renders last seen address", () => {
    render(<AnnouncementCard a={baseAnnouncement} />);
    expect(screen.getByText(/Rua das Flores, 100/)).toBeInTheDocument();
  });

  it("shows 'Procurando' badge for active status", () => {
    render(<AnnouncementCard a={baseAnnouncement} />);
    expect(screen.getByText("Procurando")).toBeInTheDocument();
  });

  it("shows 'Encontrado!' badge for found status", () => {
    render(<AnnouncementCard a={{ ...baseAnnouncement, status: "found" }} />);
    expect(screen.getByText("Encontrado!")).toBeInTheDocument();
  });

  it("shows 'Encerrado' badge for closed status", () => {
    render(<AnnouncementCard a={{ ...baseAnnouncement, status: "closed" }} />);
    expect(screen.getByText("Encerrado")).toBeInTheDocument();
  });

  it("renders dog emoji for dog species", () => {
    render(<AnnouncementCard a={baseAnnouncement} />);
    expect(screen.getByText("🐶")).toBeInTheDocument();
  });

  it("renders cat emoji for cat species", () => {
    const cat = { ...baseAnnouncement, pet: { ...baseAnnouncement.pet, species: "cat" } };
    render(<AnnouncementCard a={cat} />);
    expect(screen.getByText("🐱")).toBeInTheDocument();
  });

  it("renders breed alongside species", () => {
    render(<AnnouncementCard a={baseAnnouncement} />);
    expect(screen.getByText(/Labrador/)).toBeInTheDocument();
  });

  it("renders color when present", () => {
    render(<AnnouncementCard a={baseAnnouncement} />);
    expect(screen.getByText(/caramelo/)).toBeInTheDocument();
  });

  it("links to announcement detail page", () => {
    render(<AnnouncementCard a={baseAnnouncement} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/announcements/1");
  });
});
