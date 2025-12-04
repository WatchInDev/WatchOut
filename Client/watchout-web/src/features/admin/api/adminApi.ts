import { apiClient } from "@/utils/apiClient";
import type { User, Event, Comment } from "@/types";

export const AdminAPI = {
  getUsers: (): Promise<User[]> =>
    apiClient.get("/admin/content/users/all").then(r => r.data),
  getBannedUsers: (): Promise<User[]> =>
    apiClient.get("/admin/content/users/banned").then(r => r.data),
  blockUser: (userId: number) =>
    apiClient.patch(`/admin/actions/users/block/${userId}`),
  unblockUser: (userId: number) =>
    apiClient.patch(`/admin/actions/users/unblock/${userId}`),

  getEvents: (): Promise<Event[]> =>
    apiClient.get("/admin/content/events").then(r => r.data),
  getEventById: (eventId: number): Promise<Event> =>
    apiClient.get(`/admin/content/events/${eventId}`).then(r => r.data),
  deleteEvent: (eventId: number) =>
    apiClient.patch(`/admin/actions/events/delete/${eventId}`),
  getEventsByUser: (userId: number): Promise<Event[]> =>
    apiClient.get(`/admin/content/user/events/${userId}`).then(r => r.data),

  getCommentById: (commentId: number): Promise<Comment> =>
    apiClient.get(`/admin/content/comments/${commentId}`).then(r => r.data),
  
  getCommentsByUser: (userId: number): Promise<Comment[]> =>
    apiClient.get(`/admin/content/user/comments/${userId}`).then(r => r.data),

  getCommentsByEvent: (eventId: number): Promise<Comment[]> =>
    apiClient.get(`/admin/content/event/comments/${eventId}`).then(r => r.data),

  deleteComment: (commentId: number) =>
    apiClient.patch(`/admin/actions/comments/delete/${commentId}`),

  getReports: (): Promise<any[]> =>
    apiClient.get("/admin/content/reports").then(r => r.data),

  checkAdminAccess: (): Promise<void> =>
    apiClient.get("/admin/check").then(r => r.data)
};
