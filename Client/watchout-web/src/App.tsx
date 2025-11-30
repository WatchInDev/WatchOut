import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router"
import { routing } from "./Routing"
import { AuthProvider } from "@/context/AuthContext"

import "./App.css"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={routing} />
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
)
