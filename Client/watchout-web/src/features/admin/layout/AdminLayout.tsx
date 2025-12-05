import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";
import {
  IconDashboard,
  IconListDetails,
  IconChartBar,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";

export default function AdminLayout() {
  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: IconDashboard,
      },
      {
        title: "Zdarzenia",
        url: "/admin/events",
        icon: IconListDetails,
      },
      {
        title: "Użytkownicy",
        url: "/admin/users",
        icon: IconChartBar,
      },
    ],
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <aside className="w-64 p-6 flex flex-col sticky top-0 h-screen">
          <NavMain items={data.navMain} />
        </aside>

        <div className="@container/main flex grow p-6 w-full h-full">
          <Card className="flex-1 p-4 w-full h-full">
            <div className="w-full h-full">
              <Outlet />
            </div>
          </Card>
        </div>
      </div>
    </SidebarProvider>
  );
}
