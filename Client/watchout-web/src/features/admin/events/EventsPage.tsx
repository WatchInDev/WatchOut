import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminAPI } from "@/features/admin/api/adminApi";
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
  DialogTitle,
} from "@/components/ui/dialog";
import { createTheme } from "@mui/material";
import { reactTableStyles } from '../../../utils/theme';

export default function EventsPage() {
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState<{
    text: string;
    action: () => void;
  } | null>(null);
  const [fullImage, setFullImage] = useState<string | null>(null);

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: AdminAPI.getEvents,
  });

  const useEventComments = (eventId: number, enabled: boolean) =>
    useQuery({
      queryKey: ["eventComments", eventId],
      queryFn: async () => {
        const comments = await AdminAPI.getCommentsByEvent(eventId);
        return comments.filter((c: Comment) => !c.isDeleted);
      },
      enabled,
    });

  const parseEventImages = (
    imageField?: string | string[] | null
  ): string[] => {
    if (!imageField) return [];
    if (Array.isArray(imageField)) return imageField.filter(Boolean);
    if (typeof imageField === "string")
      return imageField
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);
    return [];
  };

  const handleDeleteEvent = (eventId: number, banAuthorId?: number) => {
    setConfirm({
      text: banAuthorId
        ? `Usunąć zdarzenie i zablokować autora?`
        : "Czy na pewno chcesz usunąć zdarzenie?",
      action: async () => {
        if (banAuthorId) await AdminAPI.blockUser(banAuthorId);
        await AdminAPI.deleteEvent(eventId);
        await queryClient.invalidateQueries({ queryKey: ["events"] });
        setConfirm(null);
      },
    });
  };

  const handleDeleteComment = (
    comment: Comment,
    eventId: number,
    banAuthorId?: number
  ) => {
    setConfirm({
      text: banAuthorId
        ? `Usunąć komentarz i zablokować autora?`
        : "Usunąć komentarz?",
      action: async () => {
        if (banAuthorId) await AdminAPI.blockUser(banAuthorId);
        await AdminAPI.deleteComment(comment.id);
        await queryClient.invalidateQueries({
          queryKey: ["eventComments", eventId],
        });
        setConfirm(null);
      },
    });
  };

  const booleanFilterFn = (
    row: any,
    columnId: string,
    filterValue: boolean[]
  ) => {
    if (!filterValue || filterValue.length === 0) return true;
    return filterValue.includes(row.getValue(columnId));
  };

  const uniqueEventTypes = [...new Set(events.map((e) => e.eventType))];

  const columns = useMemo<MRT_ColumnDef<Event>[]>(
    () => [
      { accessorKey: "name", header: "Nazwa", size: 200 },
      { accessorKey: "description", header: "Opis", size: 250 },
      { accessorKey: "authorEmail", header: "Autor (email)", size: 150 },
      {
        accessorKey: "reportedDate",
        header: "Data zgłoszenia",
        size: 100,
        Cell: ({ cell }) =>
          new Date(cell.getValue<string>()).toLocaleString("pl-PL"),
      },
      {
        accessorKey: "endDate",
        header: "Data zakończenia",
        size: 100,
        Cell: ({ cell }) =>
          new Date(cell.getValue<string>()).toLocaleString("pl-PL"),
      },
      {
        accessorKey: "eventType",
        header: "Typ",
        size: 150,
        filterVariant: "multi-select",
        filterSelectOptions: uniqueEventTypes.map((t) => ({
          value: t,
          label: t,
        })),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        size: 100,
        filterVariant: "multi-select",
        filterSelectOptions: [
          { value: true, label: "Aktywne" },
          { value: false, label: "Zakończone" },
        ],
        filterFn: booleanFilterFn,
        Cell: ({ cell }) =>
          cell.getValue<boolean>() ? (
            <Badge className="bg-green-500">Aktywne</Badge>
          ) : (
            <Badge variant="secondary">Zakończone</Badge>
          ),
      },
      {
        header: "Akcje",
        Cell: ({ row }) => {
          const event = row.original;
          if (!event.isActive)
            return <span className="text-sm opacity-70">Zakończone</span>;
          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteEvent(event.id)}
              >
                Usuń
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteEvent(event.id, event.authorId)}
              >
                Usuń + Zablokuj
              </Button>
            </div>
          );
        },
      },
    ],
    [events]
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Zdarzenia</h2>

      <MaterialReactTable
        columns={columns}
        data={events}
        enableColumnFilters
        enableSorting
        enableGlobalFilter
        enablePagination
        enableExpanding
        {...reactTableStyles}
        getRowCanExpand={() => true}
        renderDetailPanel={({ row }) => {
          const event = row.original;
          const expanded = row.getIsExpanded();

          const commentsQuery = useEventComments(event.id, expanded);
          const images = parseEventImages(event.images);

          if (!expanded) return null;

          if (commentsQuery.isLoading)
            return (
              <p className="p-4 text-sm opacity-70">Ładowanie komentarzy...</p>
            );

          const comments = commentsQuery.data ?? [];

          return (
            <Card className="p-4 w-full space-y-3">
              {images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Zdjęcia</h3>
                  <div className="flex gap-3 flex-wrap">
                    {images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt=""
                        className="w-28 h-28 rounded object-cover border cursor-pointer"
                        onClick={() => setFullImage(img)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">Komentarze</h3>

                {comments.length === 0 ? (
                  <p className="text-sm opacity-70">Brak komentarzy</p>
                ) : (
                  <div className="space-y-2">
                    {comments.map((c) => (
                      <Card key={c.id} className="p-3 flex justify-between">
                        <div>
                          <p className="font-semibold">{c.authorEmail}</p>
                          <p className="text-sm opacity-70">{c.content}</p>
                          <p className="text-sm opacity-50">
                            {new Date(c.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteComment(c, event.id)}
                          >
                            Usuń
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleDeleteComment(c, event.id, c.authorId)
                            }
                          >
                            Usuń + Zablokuj
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        }}
      />

      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdź akcję</DialogTitle>
          </DialogHeader>
          <p>{confirm?.text}</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (confirm?.action) await confirm.action();
              }}
            >
              Potwierdź
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!fullImage} onOpenChange={() => setFullImage(null)}>
        <DialogContent className="flex justify-center items-center">
          <img
            src={fullImage ?? ""}
            alt=""
            className="max-h-[80vh] max-w-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
