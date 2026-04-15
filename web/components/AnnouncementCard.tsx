import Link from "next/link";
import type { AnnouncementSummary } from "@/lib/api";

const STATUS_LABELS: Record<string, string> = {
  active: "Procurando",
  found: "Encontrado!",
  closed: "Encerrado",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-red-100 text-red-700",
  found: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

const SPECIES_EMOJI: Record<string, string> = {
  dog: "🐶",
  cat: "🐱",
  bird: "🐦",
  rabbit: "🐰",
  other: "🐾",
};

export default function AnnouncementCard({ a }: { a: AnnouncementSummary }) {
  const emoji = SPECIES_EMOJI[a.pet.species] || "🐾";
  const date = new Date(a.last_seen_at).toLocaleDateString("pt-BR");

  return (
    <Link href={`/announcements/${a.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start gap-3">
          <div className="text-3xl">{emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 truncate">{a.pet.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[a.status]}`}>
                {STATUS_LABELS[a.status]}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">
              {a.pet.breed ? `${a.pet.species} · ${a.pet.breed}` : a.pet.species}
            </p>
            {a.pet.color && (
              <p className="text-sm text-gray-500">Cor: {a.pet.color}</p>
            )}
            <p className="text-sm text-gray-600 mt-1 truncate">
              📍 {a.last_seen_address}
            </p>
            <p className="text-xs text-gray-400 mt-1">Visto em {date}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
