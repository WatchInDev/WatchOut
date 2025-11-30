import { useEffect, useMemo, useState } from "react";
import { AdminAPI } from "@/api/admin";
import type { Event, Comment } from "@/types";

import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [confirm, setConfirm] = useState<{ text: string; action: () => void } | null>(null);

  useEffect(() => {
    AdminAPI.getEvents().then(setEvents);
  }, []);

  const loadComments = async (eventId: number) => {
    const c = await AdminAPI.getCommentsForEvent(eventId);
    setComments(prev => ({ ...prev, [eventId]: c }));
  };

  const confirmDeleteEvent = (event: Event) => {
    setConfirm({
      text: `Czy na pewno chcesz usunąć zdarzenie "${event.name}"?`,
      action: async () => {
        const updated = await AdminAPI.deleteEvent(event.id);
        setEvents(updated);
        setConfirm(null);
      }
    });
  };

  const confirmDeleteAndBanEvent = (event: Event) => {
    setConfirm({
      text: `Usunąć zdarzenie "${event.name}" i zablokować autora (${event.author.email})?`,
      action: async () => {
        await AdminAPI.blockUser(event.author.id);
        const updated = await AdminAPI.deleteEvent(event.id);
        setEvents(updated);
        setConfirm(null);
      }
    });
  };

  const confirmDeleteComment = (comment: Comment) => {
    setConfirm({
      text: "Usunąć komentarz?",
      action: async () => {
        await AdminAPI.deleteComment(comment.id);
        const updated = await AdminAPI.getCommentsForEvent(comment.eventId);
        setComments(prev => ({ ...prev, [comment.eventId]: updated }));
        setConfirm(null);
      }
    });
  };

  const confirmDeleteAndBanComment = (comment: Comment) => {
    setConfirm({
      text: `Usunąć komentarz i zablokować autora (${comment.author.email})?`,
      action: async () => {
        await AdminAPI.blockUser(comment.author.id);
        await AdminAPI.deleteComment(comment.id);
        const updated = await AdminAPI.getCommentsForEvent(comment.eventId);
        setComments(prev => ({ ...prev, [comment.eventId]: updated }));
        setConfirm(null);
      }
    });
  };

  const booleanFilterFn = (row: any, columnId: string, filterValue: boolean[]) => {
    if (!filterValue || filterValue.length === 0) return true;
    return filterValue.includes(row.getValue(columnId));
  };

  const uniqueEventTypes = [...new Set(events.map(e => e.eventType.name))];

  const columns = useMemo<MRT_ColumnDef<Event>[]>(() => [
    { accessorKey: "name", header: "Nazwa", size: 200 },
    { accessorKey: "description", header: "Opis", size: 300 },
    { accessorKey: "author.email", header: "Autor (email)", size: 200 },
    {
      accessorKey: "reportedDate",
      header: "Data zgłoszenia",
      size: 180,
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString("pl-PL")
    },
    {
      accessorKey: "endDate",
      header: "Data zakończenia",
      size: 180,
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString("pl-PL")
    },
    {
      accessorKey: "eventType.name",
      header: "Typ zdarzenia",
      size: 160,
      filterVariant: "multi-select",
      filterSelectOptions: uniqueEventTypes.map(t => ({ value: t, label: t })),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      size: 120,
      filterVariant: "multi-select",
      filterSelectOptions: [
        { value: true, label: "Aktywne" },
        { value: false, label: "Zakończone" }
      ],
      filterFn: booleanFilterFn,
      Cell: ({ cell }) =>
        cell.getValue<boolean>() ? (
          <Badge className="bg-green-500">Aktywne</Badge>
        ) : (
          <Badge variant="secondary">Zakończone</Badge>
        )
    },
    {
      header: "Akcje",
      Cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={() => confirmDeleteEvent(event)}>Usuń</Button>
            <Button size="sm" variant="destructive" onClick={() => confirmDeleteAndBanEvent(event)}>Usuń + Zablokuj</Button>
          </div>
        );
      }
    }
  ], [events]);

  return (
    <div className="p-6">
      <Card className="p-4">
        <h2 className="text-2xl font-bold mb-4">Zdarzenia</h2>
        <MaterialReactTable
          columns={columns}
          data={events}
          enableColumnFilters
          enableSorting
          enableGlobalFilter
          enablePagination
          enableExpanding
          getRowCanExpand={() => true}
          renderDetailPanel={({ row }) => {
            const event = row.original;
            const commentsList = comments[event.id];

            if (!commentsList) {
              loadComments(event.id);
              return <p className="p-4 text-sm opacity-70">Ładowanie komentarzy...</p>;
            }

            return (
              <Card className="p-4 w-full">
                <h3 className="text-lg font-semibold mb-2">Komentarze</h3>
                {commentsList.length === 0 && <p className="text-sm opacity-70">Brak komentarzy</p>}
                <div className="space-y-2 mt-2">
                  {commentsList.map(c => (
                    <Card key={c.id} className="p-3 flex justify-between">
                      <div>
                        <p className="font-semibold">{c.author.name}</p>
                        <p className="text-xs text-muted-foreground">{c.author.email}</p>
                        <p>{c.content}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="destructive" size="sm" onClick={() => confirmDeleteComment(c)}>Usuń</Button>
                        <Button variant="destructive" size="sm" onClick={() => confirmDeleteAndBanComment(c)}>Usuń + Zablokuj</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            );
          }}
        />
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
