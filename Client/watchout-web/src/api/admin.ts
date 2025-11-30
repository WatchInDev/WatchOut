import type { Event, Comment, User } from "@/types";
import { mockEvents } from "@/mocks/events";
import { mockComments } from "@/mocks/comments";
import { mockUsers } from "@/mocks/users";

export const AdminAPI = {
  async getEvents(): Promise<Event[]> {
    return Promise.resolve([...mockEvents]);
  },

  async deleteEvent(id: number): Promise<Event[]> {
    const idx = mockEvents.findIndex(e => e.id === id);
    if (idx !== -1) mockEvents.splice(idx, 1);
    return Promise.resolve([...mockEvents]);
  },

  async getCommentsForEvent(eventId: number): Promise<Comment[]> {
    return Promise.resolve(mockComments.filter(c => c.eventId === eventId && !c.isDeleted));
  },

  async deleteComment(id: number): Promise<Comment[]> {
    const comment = mockComments.find(c => c.id === id);
    if (comment) comment.isDeleted = true;
    return Promise.resolve([...mockComments]);
  },

  async getUsers(): Promise<User[]> {
    return Promise.resolve([...mockUsers]);
  },

  async blockUser(id: number): Promise<User | undefined> {
    const user = mockUsers.find(u => u.id === id);
    if (user) user.isBlocked = true;
    return Promise.resolve(user);
  },

  async unblockUser(id: number): Promise<User | undefined> {
    const user = mockUsers.find(u => u.id === id);
    if (user) user.isBlocked = false;
    return Promise.resolve(user);
  },

  async getBlockedUsers(): Promise<User[]> {
    return Promise.resolve(mockUsers.filter(u => u.isBlocked));
  },

  async getUserByQuery(query: string | number): Promise<User | null> {
    const user = mockUsers.find(
      u => u.id === query || u.email.toLowerCase() === String(query).toLowerCase()
    );
    return Promise.resolve(user ?? null);
  },

  async getEventsByUser(userId: number): Promise<Event[]> {
    return Promise.resolve(mockEvents.filter(e => e.author.id === userId));
  },

  async getCommentsByUser(userId: number): Promise<Comment[]> {
    return Promise.resolve(mockComments.filter(c => c.author.id === userId && !c.isDeleted));
  }
};
