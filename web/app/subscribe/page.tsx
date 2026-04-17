"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { api } from "@/lib/api";
import { isValidBrazilianPhone, normalizePhone, PHONE_ERROR } from "@/lib/phone";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function SubscribePage() {
  const [form, setForm] = useState({
    phone: "",
    name: "",
    address: "",
    notification_radius_km: 5,
  });
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function update(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isValidBrazilianPhone(form.phone)) {
      setError(PHONE_ERROR);
      return;
    }
    if (!selectedLat || !selectedLng) {
      setError("Clique no mapa para marcar sua localização");
      return;
    }
    const normalized = normalizePhone(form.phone);
    setLoading(true);
    try {
      await api.subscribe({ ...form, phone: normalized, lat: selectedLat, lng: selectedLng });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pronto!</h2>
          <p className="text-gray-600 text-sm mb-6">
            Você receberá alertas no WhatsApp quando um pet for reportado como
            perdido na sua região.
          </p>
          <Link
            href="/"
            className="inline-block bg-red-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-600 transition-colors text-sm"
          >
            Ver mapa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">← Voltar</Link>
        <h1 className="font-semibold text-gray-900">Receber alertas</h1>
      </header>

      <div className="max-w-lg mx-auto p-4 pb-16">
        <p className="text-gray-500 text-sm mb-6">
          Cadastre-se para receber WhatsApp quando um pet for perdido perto de você.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dados pessoais */}
          <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Seus dados</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                placeholder="Nome completo"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input
                type="tel"
                placeholder="+55 11 99999-9999"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input
                type="text"
                placeholder="Rua, bairro, cidade"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </section>

          {/* Mapa */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-1">Marque sua localização *</h2>
            <p className="text-sm text-gray-500 mb-3">
              Clique no mapa para indicar onde você mora
            </p>
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

          {/* Raio */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raio de notificação: <strong>{form.notification_radius_km} km</strong>
            </label>
            <input
              type="range"
              min={1}
              max={30}
              value={form.notification_radius_km}
              onChange={(e) => update("notification_radius_km", Number(e.target.value))}
              className="w-full accent-red-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 km</span>
              <span>30 km</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Você receberá alertas de pets perdidos dentro deste raio
            </p>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Cadastrando..." : "Quero receber alertas"}
          </button>
        </form>
      </div>
    </div>
  );
}
