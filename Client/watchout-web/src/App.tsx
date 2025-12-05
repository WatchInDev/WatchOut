import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { routing } from "./Routing";
import { AuthProvider } from "@/context/AuthContext";

import "./App.css";
import { ThemeProvider } from "./base/ThemeProvider";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <MuiThemeProvider theme={createTheme({palette: {mode: "dark"}})}>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={routing} />
          </QueryClientProvider>
        </AuthProvider>
      </MuiThemeProvider>
    </ThemeProvider>
  </StrictMode>
);
