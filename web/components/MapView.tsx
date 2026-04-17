"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import type { AnnouncementSummary } from "@/lib/api";
import { announcementColor } from "@/lib/announcement-colors";

interface Props {
  announcements?: AnnouncementSummary[];
  center?: [number, number];
  zoom?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  sightings?: Array<{ lat?: number; lng?: number; saw_it: boolean; reporter_name: string }>;
}

export default function MapView({
  announcements = [],
  center,
  zoom = 13,
  onLocationSelect,
  sightings = [],
}: Props) {
  const initialCenter: [number, number] = center ?? [-15.7801, -47.9292];
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);

  // Inicializa o mapa uma única vez
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      const map = L.map(containerRef.current!).setView(initialCenter, zoom);
      mapRef.current = map;

      // Centraliza na localização real do usuário se não foi passado center explícito
      if (!center) {
        navigator.geolocation?.getCurrentPosition(
          ({ coords }) => map.setView([coords.latitude, coords.longitude], zoom),
          () => {}
        );
      }

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);

      if (onLocationSelect) {
        map.on("click", (e) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        });
      }
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atualiza marcadores sempre que announcements ou sightings mudarem
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    import("leaflet").then((L) => {
      markersRef.current!.clearLayers();

      announcements.forEach((a) => {
        if (!a.lat || !a.lng) return;
        const color = a.status === "found" ? "#22c55e" : announcementColor(a.id).hex;
        L.circleMarker([a.lat, a.lng], {
          color,
          fillColor: color,
          fillOpacity: 0.9,
          radius: 11,
          weight: 2,
        })
          .addTo(markersRef.current!)
          .bindPopup(`
            <strong>🐾 ${a.pet.name}</strong><br/>
            ${a.pet.species}${a.pet.breed ? ` - ${a.pet.breed}` : ""}<br/>
            📍 ${a.last_seen_address}<br/>
            <a href="/announcements/${a.id}" style="color:#3b82f6">Ver detalhes →</a>
          `);
      });

      sightings.forEach((s) => {
        if (!s.lat || !s.lng) return;
        L.circleMarker([s.lat, s.lng], {
          color: s.saw_it ? "blue" : "gray",
          fillColor: s.saw_it ? "blue" : "gray",
          fillOpacity: 0.6,
          radius: 7,
        })
          .addTo(markersRef.current!)
          .bindPopup(`${s.saw_it ? "✅ Visto por" : "❌ Não visto por"} ${s.reporter_name}`);
      });
    });
  }, [announcements, sightings]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg"
      style={{ minHeight: 300 }}
    />
  );
}
