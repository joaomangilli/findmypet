"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function SubscribePage() {
  const [form, setForm] = useState({
    phone: "",
    name: "",
    address: "",
    notification_radius_km: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function update(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.subscribe(form);
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Voltar
          </Link>
        </div>
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔔</div>
          <h1 className="text-xl font-bold text-gray-900">Receber alertas</h1>
          <p className="text-gray-500 text-sm mt-1">
            Cadastre-se para receber WhatsApp quando um pet for perdido perto de você
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seu nome
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seu endereço
            </label>
            <input
              type="text"
              placeholder="Rua, bairro, cidade"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              Usado para calcular o raio de notificação
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <div className="flex justify-between text-xs text-gray-400">
              <span>1 km</span>
              <span>30 km</span>
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Cadastrando..." : "Quero receber alertas"}
          </button>
        </form>
      </div>
    </div>
  );
}
