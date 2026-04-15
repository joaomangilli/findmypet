"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { api, type AnnouncementSummary } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import AnnouncementCard from "@/components/AnnouncementCard";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function HomePage() {
  const [announcements, setAnnouncements] = useState<AnnouncementSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn] = useState(isLoggedIn);

  useEffect(() => {
    api.listAnnouncements()
      .then(setAnnouncements)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="font-bold text-gray-900 text-lg">FindMyPet</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="/subscribe"
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Receber alertas
          </Link>
          {loggedIn ? (
            <Link
              href="/announcements/new"
              className="text-sm bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              + Perdi meu pet
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Entrar
            </Link>
          )}
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
              Pets desaparecidos ({announcements.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading && (
              <p className="text-sm text-gray-500 text-center py-8">Carregando...</p>
            )}
            {!loading && announcements.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                Nenhum pet desaparecido na região 🎉
              </p>
            )}
            {announcements.map((a) => (
              <AnnouncementCard key={a.id} a={a} />
            ))}
          </div>
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          <MapView announcements={announcements} zoom={12} />
        </main>
      </div>
    </div>
  );
}
