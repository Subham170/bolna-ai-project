import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaCog,
  FaTasks,
  FaTachometerAlt,
  FaUsers,
} from "react-icons/fa";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Manage Jobs", href: "/manage-jobs" },
  { label: "All Candidates", href: "/all-candidates" },
  { label: "My Tasks", href: "#" },
  { label: "Calendar", href: "#" },
  { label: "Settings", href: "#" },
];

const iconByLabel = {
  Dashboard: FaTachometerAlt,
  "Manage Jobs": FaBriefcase,
  "All Candidates": FaUsers,
  "My Tasks": FaTasks,
  Calendar: FaCalendarAlt,
  Settings: FaCog,
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 md:flex-row">
      <Sidebar className="md:min-h-screen">
        <SidebarHeader>
          <div className="text-2xl font-bold tracking-wide text-blue-700">HireFlow</div>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">
            Recruitment Suite
          </p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item, index) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                  <SidebarMenuButton isActive={index === 0}>
                    {(() => {
                      const Icon = iconByLabel[item.label];
                      return Icon ? <Icon className="text-sm" /> : null;
                    })()}
                    {item.label}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <main className="flex flex-1 overflow-x-auto p-4 md:p-8">
        <section className="w-full">
          <div className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-700">Dashboard</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">HireFlow</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Track open roles, matched candidates, and interview activity from one
              recruiting workspace.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">Open Positions</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">12</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">Active Candidates</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">148</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase text-slate-500">Calls Scheduled</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">27</p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/manage-jobs"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Manage Jobs
              </Link>
              <Link
                href="/all-candidates"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View Candidates
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
