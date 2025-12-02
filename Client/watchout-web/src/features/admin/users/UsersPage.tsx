import { useState } from "react"
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

  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ["users"],
    queryFn: AdminAPI.getUsers
  })

  const userEventsQuery = (userId: number) =>
    useQuery({
      queryKey: ["userEvents", userId],
      queryFn: () => AdminAPI.getEventsByUser(userId),
      enabled: false // dont fetch automatically
    })

  const userCommentsQuery = (userId: number) =>
    useQuery({
      queryKey: ["userComments", userId],
      queryFn: () => AdminAPI.getCommentsByUser(userId),
      enabled: false
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

  const handleDeleteEvent = async (eventId: number) => {
    await AdminAPI.deleteEvent(eventId)
await queryClient.invalidateQueries({ queryKey: ["users"] })  }

  const handleDeleteComment = async (comment: Comment) => {
    await AdminAPI.deleteComment(comment.id)
    await queryClient.invalidateQueries({ queryKey: ["users"] })
  }

  const columns = [
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
        { value: true, label: "Zablokowany" }
      ],
      Cell: ({ cell }) =>
        cell.getValue<boolean>() ? <Badge variant="destructive">Zablokowany</Badge> : <Badge variant="secondary">Aktywny</Badge>
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
  ] as MRT_ColumnDef<User>[]

  return (
    <div className="p-6">
      <Card className="p-4">
        <h2 className="text-2xl font-bold mb-4">Użytkownicy</h2>
        <MaterialReactTable columns={columns} data={users} enableExpanding
          renderDetailPanel={({ row }) => {
            const user = row.original
            const eventsQuery = userEventsQuery(user.id)
            const commentsQuery = userCommentsQuery(user.id)

            if (!eventsQuery.data && !eventsQuery.isFetching) eventsQuery.refetch()
            if (!commentsQuery.data && !commentsQuery.isFetching) commentsQuery.refetch()

            if (eventsQuery.isLoading || commentsQuery.isLoading) return <p className="p-4">Ładowanie...</p>

            return (
              <Card className="p-4 w-full space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Zdarzenia użytkownika</h3>
                  {eventsQuery.data?.length === 0 ? (
                    <p className="text-sm opacity-70">Brak zdarzeń</p>
                  ) : (
                    <ul className="space-y-2">
                      {eventsQuery.data?.map(e => (
                        <li key={e.id} className="p-2 border rounded flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{e.name}</p>
                            <p className="text-sm text-muted-foreground">{e.description}</p>
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(e.id)}>Usuń</Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Komentarze użytkownika</h3>
                  {commentsQuery.data?.length === 0 ? (
                    <p className="text-sm opacity-70">Brak komentarzy</p>
                  ) : (
                    <ul className="space-y-2">
                      {commentsQuery.data?.map(c => (
                        <li key={c.id} className="p-2 border rounded flex justify-between items-start">
                          <div>
                            <p className="text-sm">{c.content}</p>
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteComment(c)}>Usuń</Button>
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
  )
}
