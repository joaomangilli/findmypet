// Paleta de cores distintas para identificar anúncios no mapa e na lista
const PALETTE = [
  { hex: "#3b82f6", bg: "bg-blue-500",   ring: "ring-blue-400"   },
  { hex: "#f97316", bg: "bg-orange-500", ring: "ring-orange-400" },
  { hex: "#8b5cf6", bg: "bg-violet-500", ring: "ring-violet-400" },
  { hex: "#14b8a6", bg: "bg-teal-500",   ring: "ring-teal-400"   },
  { hex: "#ec4899", bg: "bg-pink-500",   ring: "ring-pink-400"   },
  { hex: "#eab308", bg: "bg-yellow-500", ring: "ring-yellow-400" },
  { hex: "#6366f1", bg: "bg-indigo-500", ring: "ring-indigo-400" },
  { hex: "#84cc16", bg: "bg-lime-500",   ring: "ring-lime-400"   },
];

export function announcementColor(id: number) {
  return PALETTE[id % PALETTE.length];
}
