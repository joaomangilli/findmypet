"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const SPECIES = [
  { value: "dog", label: "🐶 Cachorro" },
  { value: "cat", label: "🐱 Gato" },
  { value: "bird", label: "🐦 Pássaro" },
  { value: "rabbit", label: "🐰 Coelho" },
  { value: "other", label: "🐾 Outro" },
];

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);

  const [pet, setPet] = useState({
    name: "",
    species: "dog",
    breed: "",
    color: "",
    description: "",
  });
  const [announcement, setAnnouncement] = useState({
    description: "",
    last_seen_address: "",
    last_seen_at: new Date().toISOString().slice(0, 16),
    notification_radius_km: 5,
  });

  useEffect(() => {
    if (!isLoggedIn()) router.push("/login");
  }, [router]);

  function updatePet(field: string, value: string) {
    setPet((p) => ({ ...p, [field]: value }));
  }

  function updateAnnouncement(field: string, value: string | number) {
    setAnnouncement((a) => ({ ...a, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedLat || !selectedLng) {
      setError("Clique no mapa para marcar o último local visto");
      return;
    }

    setLoading(true);
    try {
      const result = await api.createAnnouncement({
        ...announcement,
        pet,
        lat: selectedLat,
        lng: selectedLng,
        last_seen_at: new Date(announcement.last_seen_at).toISOString(),
      });
      router.push(`/announcements/${result.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar anúncio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-gray-700">←</Link>
        <h1 className="font-semibold text-gray-900">Reportar pet perdido</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4 pb-16">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pet info */}
          <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Informações do pet</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do pet *</label>
                <input
                  type="text"
                  value={pet.name}
                  onChange={(e) => updatePet("name", e.target.value)}
                  required
                  placeholder="Ex: Rex, Luna..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Espécie *</label>
                <select
                  value={pet.species}
                  onChange={(e) => updatePet("species", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {SPECIES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
                <input
                  type="text"
                  value={pet.breed}
                  onChange={(e) => updatePet("breed", e.target.value)}
                  placeholder="Ex: Labrador"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                <input
                  type="text"
                  value={pet.color}
                  onChange={(e) => updatePet("color", e.target.value)}
                  placeholder="Ex: caramelo"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do pet</label>
                <textarea
                  value={pet.description}
                  onChange={(e) => updatePet("description", e.target.value)}
                  rows={2}
                  placeholder="Características marcantes, comportamento..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </section>

          {/* Announcement info */}
          <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Detalhes do desaparecimento</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quando desapareceu *</label>
              <input
                type="datetime-local"
                value={announcement.last_seen_at}
                onChange={(e) => updateAnnouncement("last_seen_at", e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço do último avistamento *</label>
              <input
                type="text"
                value={announcement.last_seen_address}
                onChange={(e) => updateAnnouncement("last_seen_address", e.target.value)}
                required
                placeholder="Rua, número, bairro"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                O que aconteceu? *
              </label>
              <textarea
                value={announcement.description}
                onChange={(e) => updateAnnouncement("description", e.target.value)}
                required
                rows={3}
                placeholder="Descreva as circunstâncias do desaparecimento..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raio de notificação: <strong>{announcement.notification_radius_km} km</strong>
              </label>
              <input
                type="range"
                min={1}
                max={30}
                value={announcement.notification_radius_km}
                onChange={(e) => updateAnnouncement("notification_radius_km", Number(e.target.value))}
                className="w-full accent-red-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                WhatsApp será enviado para todos cadastrados neste raio
              </p>
            </div>
          </section>

          {/* Map */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-2">
              Marque o local no mapa *
            </h2>
            <p className="text-sm text-gray-500 mb-3">Clique para marcar o último local onde viu o pet</p>
            {selectedLat && selectedLng && (
              <p className="text-xs text-green-600 mb-2">
                ✅ Local selecionado: {selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}
              </p>
            )}
            <div className="h-64 rounded-lg overflow-hidden">
              <MapView
                onLocationSelect={(lat, lng) => {
                  setSelectedLat(lat);
                  setSelectedLng(lng);
                }}
                zoom={13}
              />
            </div>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 text-base"
          >
            {loading ? "Publicando e notificando..." : "🔔 Publicar e notificar vizinhança"}
          </button>
        </form>
      </div>
    </div>
  );
}
