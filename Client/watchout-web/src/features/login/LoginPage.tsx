import React, { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export default function AdminLogin() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate("/admin")
    } catch (err: any) {
      setError(err.message || "Błąd logowania")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col gap-24 items-center justify-center">
      <h1 className="text-4xl">Watchout</h1>
      <Card className="w-full max-w-md p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Administracja — logowanie</h1>
        {error && <div className="text-destructive mb-4 text-center">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-1">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Twój email"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="mb-1">Hasło</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Twoje hasło"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logowanie..." : "Zaloguj"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
