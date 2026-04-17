"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { isValidBrazilianPhone, normalizePhone, PHONE_ERROR } from "@/lib/phone";

type Step = "phone" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isValidBrazilianPhone(phone)) {
      setError(PHONE_ERROR);
      return;
    }
    const normalized = normalizePhone(phone);
    setLoading(true);
    try {
      await api.sendOtp(normalized);
      setPhone(normalized);
      setStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar código");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await api.verifyOtp(phone, code, name || undefined);
      saveAuth(token, user);
      router.push("/announcements/new");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setLoading(false);
    }
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
          <div className="text-4xl mb-3">🐾</div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === "phone" ? "Entrar ou criar conta" : "Confirme o código"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === "phone"
              ? "Enviamos um código pelo WhatsApp para autenticar"
              : <>Código enviado para <strong>{phone}</strong></>}
          </p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número do WhatsApp
              </label>
              <input
                type="tel"
                placeholder="+55 11 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Receber código"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de 6 dígitos
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seu nome{" "}
                <span className="text-gray-400 font-normal">(somente no primeiro acesso)</span>
              </label>
              <input
                type="text"
                placeholder="Como podemos te chamar?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("phone"); setCode(""); setError(""); }}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Trocar número
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Só quer receber alertas sem criar conta?{" "}
          <Link href="/subscribe" className="text-red-500 hover:underline">
            Inscreva-se aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
