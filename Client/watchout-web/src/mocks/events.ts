import type { Event } from "../types"
import { mockUsers } from "./users";
import { mockEventTypes } from "./eventTypes";

export const mockEvents: Event[] = Array.from({ length: 12 }).map((_, i) => {
  const base = new Date(2025, 0, 2, 10, 0);
  const reported = new Date(base.getTime() + i * 24 * 60 * 60 * 1000 + (i % 3) * 60 * 60 * 1000);
  const durationHours = 6;
  const end = new Date(reported.getTime() + durationHours * 60 * 60 * 1000);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

  return {
    id: i + 1,
    name: `Zdarzenie #${i + 1}`,
    description: "Opis przykładowego zdarzenia. Lorem ipsum dolor sit amet.",
    image: "",
    reportedDate: fmt(reported),
    endDate: fmt(end),
    isActive: i % 2 === 0,
    author: mockUsers[i % mockUsers.length],
    eventType: mockEventTypes[i % mockEventTypes.length],
    location: { latitude: 52.2 + i * 0.01, longitude: 21.0 + i * 0.01 }
  } as Event;
});

