import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleLogin() {
    const ok = await login(email, password)
    if (!ok) {
      setError("Niepoprawne dane logowania")
      return
    }
    navigate("/admin")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="p-6 w-[360px]">
        <h1 className="text-xl font-semibold mb-4">Panel administratora</h1>

        <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="mb-2" />
        <Input type="password" placeholder="Hasło" value={password} onChange={e => setPassword(e.target.value)} className="mb-4" />

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <Button onClick={handleLogin} className="w-full">
          Zaloguj się
        </Button>
      </Card>
    </div>
  )
}
