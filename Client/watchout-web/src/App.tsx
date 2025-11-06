import { StrictMode } from "react";
import "./App.css";
import { createRoot } from "react-dom/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import "dayjs/locale/pl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { routing } from "./Routing";
import { ThemeProvider } from "@mui/material";
import theme from "./utils/theme";

const queryClient = new QueryClient();

dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.locale("pl");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <RouterProvider router={routing} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
