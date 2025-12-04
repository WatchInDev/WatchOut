import type { Comment } from "@/types";
import { mockUsers } from "./users";

export const mockComments: Comment[] = Array.from({ length: 40 }).map((_, i) => ({
  id: i + 1,
  content: `Komentarz numer ${i + 1}`,
  author: mockUsers[(i + 2) % mockUsers.length],
  eventId: (i % 12) + 1,
  isDeleted: false
}));