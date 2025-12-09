import type { User } from "@/types";

export const mockUsers: User[] = [
  { id: 1, name: "Jan", email: "jan@example.com", reputation: 0.8, externalId: "x1", isBlocked: false },
  { id: 2, name: "Adam", email: "adam@example.com", reputation: 0.2, externalId: "x2", isBlocked: false }
]