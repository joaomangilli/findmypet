"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function SightingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const currentUser = getStoredUser();

  const [form, setForm] = useState({
    saw_it: true,
    reporter_name: currentUser?.name || "",
    reporter_phone: currentUser?.phone || "",
    address: "",
    description: "",
    seen_at: new Date().toISOString().slice(0, 16),
  });
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.createSighting(id, {
        ...form,
        seen_at: new Date(form.seen_at).toISOString(),
        lat: selectedLat ?? undefined,
        lng: selectedLng ?? undefined,
      });
      router.push(`/announcements/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href={`/announcements/${id}`} className="text-gray-500 hover:text-gray-700 text-sm">← Voltar</Link>
        <h1 className="font-semibold text-gray-900">Reportar avistamento</h1>
      </header>

      <div className="max-w-lg mx-auto p-4 pb-16">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Saw it or not */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="font-medium text-gray-800 mb-3">Você viu este pet?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => update("saw_it", true)}
                className={`py-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                  form.saw_it
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                ✅ Sim, vi!
              </button>
              <button
                type="button"
                onClick={() => update("saw_it", false)}
                className={`py-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                  !form.saw_it
                    ? "border-gray-500 bg-gray-50 text-gray-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                ❌ Não vi
              </button>
            </div>
          </div>

          {/* Reporter info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-medium text-gray-800">Suas informações</h2>
            {!currentUser && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seu nome *</label>
                  <input
                    type="text"
                    value={form.reporter_name}
                    onChange={(e) => update("reporter_name", e.target.value)}
                    required
                    placeholder="Como você se chama?"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp <span className="text-gray-400">(opcional)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.reporter_phone}
                    onChange={(e) => update("reporter_phone", e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
            {currentUser && (
              <p className="text-sm text-gray-600">
                Reportando como <strong>{currentUser.name}</strong>
              </p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quando viu?</label>
              <input
                type="datetime-local"
                value={form.seen_at}
                onChange={(e) => update("seen_at", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Onde viu?</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Rua, bairro..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={2}
                placeholder="Descreva o que viu..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-medium text-gray-800 mb-1">
              Marcar local no mapa <span className="text-gray-400 font-normal text-sm">(opcional)</span>
            </h2>
            <p className="text-xs text-gray-500 mb-3">Clique para marcar onde viu o pet</p>
            {selectedLat && selectedLng && (
              <p className="text-xs text-green-600 mb-2">
                ✅ {selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}
              </p>
            )}
            <div className="h-48 rounded-lg overflow-hidden">
              <MapView
                onLocationSelect={(lat, lng) => {
                  setSelectedLat(lat);
                  setSelectedLng(lng);
                }}
                zoom={14}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar avistamento"}
          </button>
        </form>
      </div>
    </div>
  );
}
