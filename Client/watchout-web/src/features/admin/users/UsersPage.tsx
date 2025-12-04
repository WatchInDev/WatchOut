import { useState, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AdminAPI } from "@/features/admin/api/adminApi"
import type { User, Event, Comment } from "@/types"

import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [confirm, setConfirm] = useState<{ text: string; action: () => void } | null>(null)
  const [fullImage, setFullImage] = useState<string | null>(null)

  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ["users"],
    queryFn: AdminAPI.getUsers
  })

  const useUserEvents = (userId: number, enabled: boolean) =>
    useQuery({
      queryKey: ["userEvents", userId],
      queryFn: () => AdminAPI.getEventsByUser(userId),
      enabled
    })

  const useUserComments = (userId: number, enabled: boolean) =>
    useQuery({
      queryKey: ["userComments", userId],
      queryFn: async () => {
        const comments = await AdminAPI.getCommentsByUser(userId)
        return comments.filter((c: Comment) => !c.isDeleted)
      },
      enabled
    })

  const handleBlock = (user: User) => {
    setConfirm({
      text: `Czy na pewno chcesz zablokować użytkownika ${user.name} (${user.email})?`,
      action: async () => {
        await AdminAPI.blockUser(user.id)
        await refetchUsers()
        setConfirm(null)
      }
    })
  }

  const handleUnblock = (user: User) => {
    setConfirm({
      text: `Czy na pewno chcesz odblokować użytkownika ${user.name} (${user.email})?`,
      action: async () => {
        await AdminAPI.unblockUser(user.id)
        await refetchUsers()
        setConfirm(null)
      }
    })
  }

  const handleDeleteEvent = (eventId: number, userId: number) => {
    setConfirm({
      text: "Czy na pewno chcesz usunąć to zdarzenie?",
      action: async () => {
        await AdminAPI.deleteEvent(eventId)
        await queryClient.invalidateQueries({ queryKey: ["userEvents", userId] })
        setConfirm(null)
      }
    })
  }

  const handleDeleteComment = (comment: Comment, userId: number) => {
    setConfirm({
      text: "Czy na pewno chcesz usunąć ten komentarz?",
      action: async () => {
        await AdminAPI.deleteComment(comment.id)
        await queryClient.invalidateQueries({ queryKey: ["userComments", userId] })
        setConfirm(null)
      }
    })
  }

  const parseEventImages = (imageField?: string | string[] | null): string[] => {
    if (!imageField) return []

    if (Array.isArray(imageField)) {
      return imageField.filter(Boolean)
    }

    if (typeof imageField === "string") {
      return imageField
        .split(",")
        .map(img => img.trim())
        .filter(Boolean)
    }

    return []
  }

  const columns = useMemo(() => [
    { accessorKey: "id", header: "ID", size: 80 },
    { accessorKey: "name", header: "Imię", size: 150 },
    { accessorKey: "email", header: "Email", size: 200 },
    {
      accessorKey: "reputation",
      header: "Reputacja",
      size: 100,
      Cell: ({ cell }) => (cell.getValue<number>() ?? 0).toFixed(3)
    },
    { accessorKey: "externalId", header: "External ID", size: 150 },
    {
      accessorKey: "isBlocked",
      header: "Status",
      size: 120,
      filterVariant: "multi-select",
      filterSelectOptions: [
        { value: false, label: "Aktywny" },
        { value: true, label: "Zablokowany" }
      ],
      Cell: ({ cell }) =>
        cell.getValue<boolean>() ? (
          <Badge variant="destructive">Zablokowany</Badge>
        ) : (
          <Badge variant="secondary">Aktywny</Badge>
        )
    },
    {
      header: "Akcje",
      Cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex gap-2">
            {user.isBlocked ? (
              <Button size="sm" variant="secondary" onClick={() => handleUnblock(user)}>Odblokuj</Button>
            ) : (
              <Button size="sm" variant="destructive" onClick={() => handleBlock(user)}>Zablokuj</Button>
            )}
          </div>
        )
      }
    }
  ] as MRT_ColumnDef<User>[], [])

  return (
    <div className="p-6">
      <Card className="p-4">
        <h2 className="text-2xl font-bold mb-4">Użytkownicy</h2>

        <MaterialReactTable
          columns={columns}
          data={users}
          enableExpanding
          renderDetailPanel={({ row }) => {
            const user = row.original
            const eventsQuery = useUserEvents(user.id, row.getIsExpanded())
            const commentsQuery = useUserComments(user.id, row.getIsExpanded())

            if (eventsQuery.isLoading || commentsQuery.isLoading) {
              return <p className="p-4">Ładowanie...</p>
            }

            return (
              <Card className="p-4 w-full space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Zdarzenia użytkownika</h3>

                  {eventsQuery.data?.length === 0 ? (
                    <p className="text-sm opacity-70">Brak zdarzeń</p>
                  ) : (
                    <ul className="space-y-2">
                      {eventsQuery.data?.map((e: Event) => {
                        const images = parseEventImages(e.images)

                        return (
                          <li key={e.id} className="p-2 border rounded flex justify-between items-start gap-4">
                            <div className="flex flex-col gap-1">
                              <p className="font-semibold">{e.name}</p>
                              <p className="text-sm opacity-70">{e.description}</p>

                              <p className="text-xs opacity-70">
                                Typ: {e.eventType}
                              </p>

                              <p className="text-xs opacity-70">
                                Data zgłoszenia: {new Date(e.reportedDate).toLocaleString()}
                              </p>

                              <p className="text-xs opacity-70">
                                Data zakończenia: {new Date(e.endDate).toLocaleString()}
                              </p>

                              <p className="text-xs opacity-70">
                                Status: {e.isActive ? (
                                  <Badge variant="secondary">Aktywne</Badge>
                                ) : (
                                  <Badge variant="destructive">Zakończone</Badge>
                                )}
                              </p>

                              {images.length > 0 && (
                                <div className="flex gap-2 flex-wrap mt-2">
                                  {images.map((img, idx) => (
                                    <img
                                      key={idx}
                                      src={img}
                                      alt=""
                                      className="w-24 h-24 object-cover rounded border cursor-pointer"
                                      onClick={() => setFullImage(img)}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteEvent(e.id, user.id)}
                            >
                              Usuń
                            </Button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Komentarze użytkownika</h3>

                  {commentsQuery.data?.length === 0 ? (
                    <p className="text-sm opacity-70">Brak komentarzy</p>
                  ) : (
                    <ul className="space-y-2">
                      {commentsQuery.data?.map((c: Comment) => (
                        <li key={c.id} className="p-2 border rounded flex justify-between items-start">
                          <p className="text-sm">{c.content}</p>
                          <p className="text-sm opacity-50">{new Date(c.createdAt).toLocaleString()}</p>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteComment(c, user.id)}
                          >
                            Usuń
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>
            )
          }}
        />
      </Card>

      {/* Confirm Dialog */}
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

      {/* Full Image Dialog */}
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
  )
}
