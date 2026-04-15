"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { api, type AnnouncementDetail } from "@/lib/api";
import { isLoggedIn, getStoredUser } from "@/lib/auth";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const STATUS_LABELS: Record<string, string> = {
  active: "🔴 Procurando",
  found: "🟢 Encontrado!",
  closed: "⚫ Encerrado",
};

export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  const loggedIn = isLoggedIn();
  const currentUser = getStoredUser();
  const isOwner = loggedIn && currentUser?.id === announcement?.owner?.id;

  useEffect(() => {
    api.getAnnouncement(id)
      .then(setAnnouncement)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function markAsFound() {
    if (!announcement) return;
    setClosing(true);
    try {
      const updated = await api.closeAnnouncement(announcement.id, "found");
      setAnnouncement(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setClosing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Anúncio não encontrado</p>
      </div>
    );
  }

  const { pet, sightings } = announcement;
  const seenSightings = sightings.filter((s) => s.saw_it);
  const mapSightings = sightings.filter((s) => s.lat && s.lng);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">← Mapa</Link>
        <div className="flex-1" />
        <span className="text-sm font-medium">{STATUS_LABELS[announcement.status]}</span>
      </header>

      <div className="max-w-2xl mx-auto p-4 pb-16 space-y-4">
        {/* Pet info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{pet.name}</h1>
              <p className="text-gray-500 text-sm">
                {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}
                {pet.color ? ` · ${pet.color}` : ""}
              </p>
            </div>
            {isOwner && announcement.status === "active" && (
              <button
                onClick={markAsFound}
                disabled={closing}
                className="text-sm bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {closing ? "..." : "✅ Encontrei!"}
              </button>
            )}
          </div>
          {pet.description && (
            <p className="text-gray-600 text-sm mt-3">{pet.description}</p>
          )}
        </div>

        {/* Last seen */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-2">Último avistamento</h2>
          <p className="text-sm text-gray-600">📍 {announcement.last_seen_address}</p>
          <p className="text-sm text-gray-500 mt-1">
            🕐 {new Date(announcement.last_seen_at).toLocaleString("pt-BR")}
          </p>
          <p className="text-sm text-gray-600 mt-3">{announcement.description}</p>
        </div>

        {/* Map */}
        {(announcement.lat || seenSightings.length > 0) && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Mapa de avistamentos</h2>
            <div className="h-64 rounded-lg overflow-hidden">
              <MapView
                announcements={[announcement]}
                sightings={mapSightings}
                center={
                  announcement.lat && announcement.lng
                    ? [announcement.lat, announcement.lng]
                    : undefined
                }
                zoom={14}
              />
            </div>
          </div>
        )}

        {/* Sightings */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">
              Avistamentos ({sightings.length})
            </h2>
            {announcement.status === "active" && (
              <Link
                href={`/announcements/${id}/sight`}
                className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
              >
                + Reportar
              </Link>
            )}
          </div>
          {sightings.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhum avistamento ainda. Você viu esse pet?
            </p>
          ) : (
            <div className="space-y-3">
              {sightings.map((s) => (
                <div
                  key={s.id}
                  className={`rounded-lg p-3 text-sm ${s.saw_it ? "bg-blue-50 border border-blue-100" : "bg-gray-50 border border-gray-100"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{s.saw_it ? "✅" : "❌"}</span>
                    <span className="font-medium">{s.reporter_name}</span>
                    <span className="text-gray-400 text-xs">
                      {s.seen_at
                        ? new Date(s.seen_at).toLocaleString("pt-BR")
                        : new Date(s.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {s.address && <p className="text-gray-600">📍 {s.address}</p>}
                  {s.description && <p className="text-gray-600 mt-1">{s.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {announcement.status === "active" && (
          <Link
            href={`/announcements/${id}/sight`}
            className="block w-full text-center bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            Eu vi esse pet!
          </Link>
        )}
      </div>
    </div>
  );
}
