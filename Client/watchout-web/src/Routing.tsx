import { createBrowserRouter } from "react-router-dom";
import LoginPage from "@/features/login/LoginPage";
import AdminLayout from "@/features/admin/layout/AdminLayout";
import DashboardPage from "@/features/admin/dashboard/DashboardPage";
import EventsPage from "@/features/admin/events/EventsPage";
import UsersPage from "@/features/admin/users/UsersPage";
import { RequireAdmin } from "@/components/ui/requireAdmin";
import { Navigate } from "react-router-dom";

export const routing = createBrowserRouter([
  { path: "/", element: <Navigate to="/admin/login" replace /> },
  { path: "/admin/login", element: <LoginPage /> },

  {
    path: "/admin",
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "events", element: <EventsPage /> },
      { path: "users", element: <UsersPage /> },
    ],
  },
]);
