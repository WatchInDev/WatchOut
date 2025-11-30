import { Outlet, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
          <nav className="space-y-3">
            <NavLink to="/admin" className={({ isActive }) =>
              `block py-2 px-3 rounded hover:bg-gray-700 ${isActive ? "bg-gray-700" : ""}`
            }>Dashboard</NavLink>
            <NavLink to="/admin/events" className={({ isActive }) =>
              `block py-2 px-3 rounded hover:bg-gray-700 ${isActive ? "bg-gray-700" : ""}`
            }>Zdarzenia</NavLink>
            <NavLink to="/admin/users" className={({ isActive }) =>
              `block py-2 px-3 rounded hover:bg-gray-700 ${isActive ? "bg-gray-700" : ""}`
            }>Użytkownicy</NavLink>
          </nav>
        </div>

        <Button variant="secondary" onClick={logout}>Wyloguj</Button>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
