import { useEffect, useMemo, useState } from "react";
import { AdminAPI } from "@/api/admin";
import type { User, Event, Comment } from "@/types";

import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable
} from "material-react-table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [events, setEvents] = useState<Record<number, Event[]>>({});
  const [loadingEvents, setLoadingEvents] = useState<Record<number, boolean>>({});
  const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});
  const [confirm, setConfirm] = useState<{ text: string; action: () => void } | null>(null);

  useEffect(() => {
    AdminAPI.getUsers().then(setUsers);
  }, []);

  const handleBlock = (user: User) => {
    setConfirm({
      text: `Czy na pewno chcesz zablokować użytkownika ${user.name} (${user.email})?`,
      action: async () => {
        await AdminAPI.blockUser(user.id);
        const updated = await AdminAPI.getUsers();
        setUsers(updated);
        setConfirm(null);
      }
    });
  };

  const handleUnblock = (user: User) => {
    setConfirm({
      text: `Czy na pewno chcesz odblokować użytkownika ${user.name} (${user.email})?`,
      action: async () => {
        await AdminAPI.unblockUser(user.id);
        const updated = await AdminAPI.getUsers();
        setUsers(updated);
        setConfirm(null);
      }
    });
  };

  const loadUserEvents = async (userId: number) => {
    setLoadingEvents(prev => ({ ...prev, [userId]: true }));
    const ev = await AdminAPI.getEventsByUser(userId);
    setEvents(prev => ({ ...prev, [userId]: ev }));
    setLoadingEvents(prev => ({ ...prev, [userId]: false }));
  };

  const loadUserComments = async (userId: number) => {
    setLoadingComments(prev => ({ ...prev, [userId]: true }));
    const cm = await AdminAPI.getCommentsByUser(userId);
    setComments(prev => ({ ...prev, [userId]: cm }));
    setLoadingComments(prev => ({ ...prev, [userId]: false }));
  };

  const handleDeleteEvent = (userId: number, eventId: number) => {
    setConfirm({
      text: "Czy na pewno chcesz usunąć zdarzenie?",
      action: async () => {
        await AdminAPI.deleteEvent(eventId);
        const updated = await AdminAPI.getEventsByUser(userId);
        setEvents(prev => ({ ...prev, [userId]: updated }));
        setConfirm(null);
      }
    });
  };

  const handleDeleteComment = (userId: number, comment: Comment, banAuthor = false) => {
    setConfirm({
      text: banAuthor
        ? `Czy na pewno chcesz usunąć komentarz i zablokować autora (${comment.author.email})?`
        : "Czy na pewno chcesz usunąć komentarz?",
      action: async () => {
        if (banAuthor) await AdminAPI.blockUser(comment.author.id);
        await AdminAPI.deleteComment(comment.id);
        const updated = await AdminAPI.getCommentsByUser(userId);
        setComments(prev => ({ ...prev, [userId]: updated }));
        setConfirm(null);
      }
    });
  };

  const columns = useMemo<MRT_ColumnDef<User>[]>(() => [
    { accessorKey: "id", header: "ID", size: 80 },
    { accessorKey: "name", header: "Imię", size: 150 },
    { accessorKey: "email", header: "Email", size: 200 },
    { accessorKey: "reputation", header: "Reputacja", size: 100 },
    { accessorKey: "externalId", header: "External ID", size: 150 },
    {
      accessorKey: "isBlocked",
      header: "Status",
      size: 120,
      filterVariant: "multi-select",
      filterSelectOptions: [
        { value: false, label: "Aktywny" },
        { value: true, label: "Zablokowany" },
      ],
      filterFn: (row, columnId, filterValues: boolean[]) => {
        if (!filterValues || filterValues.length === 0) return true;
        return filterValues.includes(row.getValue<boolean>(columnId));
      },
      Cell: ({ cell }) =>
        cell.getValue<boolean>() ? (
          <Badge variant="destructive">Zablokowany</Badge>
        ) : (
          <Badge variant="secondary">Aktywny</Badge>
        ),
    },
    {
      header: "Akcje",
      Cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex gap-2">
            {user.isBlocked ? (
              <Button size="sm" variant="secondary" onClick={() => handleUnblock(user)}>Odblokuj</Button>
            ) : (
              <Button size="sm" variant="destructive" onClick={() => handleBlock(user)}>Zablokuj</Button>
            )}
          </div>
        );
      }
    }
  ], [users]);

  const table = useMaterialReactTable({
    columns,
    data: users,
    enableColumnFilters: true,
    enableSorting: true,
    enableGlobalFilter: true,
    enablePagination: true,
    enableExpanding: true,
    getRowCanExpand: () => true,
    renderDetailPanel: ({ row }) => {
      const user = row.original;

      if (!events[user.id] && !loadingEvents[user.id]) loadUserEvents(user.id);
      if (!comments[user.id] && !loadingComments[user.id]) loadUserComments(user.id);

      const userEvents = events[user.id] || [];
      const userComments = comments[user.id] || [];

      const isLoading = loadingEvents[user.id] || loadingComments[user.id];

      if (isLoading) {
        return (
          <Card className="p-4 w-full text-center">
            <p>Ładowanie danych...</p>
          </Card>
        );
      }

      return (
        <Card className="p-4 w-full space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Zdarzenia użytkownika</h3>
            {userEvents.length === 0 ? (
              <p className="text-sm opacity-70">Brak zdarzeń</p>
            ) : (
              <ul className="space-y-2">
                {userEvents.map(e => (
                  <li key={e.id} className="p-2 border rounded flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{e.name}</p>
                      <p className="text-sm text-muted-foreground">{e.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Data zgłoszenia: {new Date(e.reportedDate).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Data zakończenia: {new Date(e.endDate).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Typ: {e.eventType.name}</p>
                      <Badge className={e.isActive ? "bg-green-500" : "bg-gray-400"}>
                        {e.isActive ? "Aktywne" : "Zakończone"}
                      </Badge>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(user.id, e.id)}>Usuń</Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Komentarze użytkownika</h3>
            {userComments.length === 0 ? (
              <p className="text-sm opacity-70">Brak komentarzy</p>
            ) : (
              <ul className="space-y-2">
                {userComments.map(c => (
                  <li key={c.id} className="p-2 border rounded flex justify-between items-start">
                    <div>
                      <p className="text-sm">{c.content}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteComment(user.id, c)}>Usuń</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      );
    }
  });

  return (
    <div className="p-6">
      <Card className="p-4">
        <h2 className="text-2xl font-bold mb-4">Użytkownicy</h2>
        <MaterialReactTable table={table} />
      </Card>

      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdź akcję</DialogTitle>
          </DialogHeader>
          <p>{confirm?.text}</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirm(null)}>Anuluj</Button>
            <Button variant="destructive" onClick={confirm?.action}>Potwierdź</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
