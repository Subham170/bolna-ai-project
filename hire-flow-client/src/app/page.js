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
    <div className="flex min-h-screen bg-linear-to-br from-slate-100 to-slate-200 text-slate-900">
      <Sidebar className="min-h-screen">
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

      <main className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white/90 p-10 shadow-sm">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">HireFlow</h1>
          <p className="mt-3 max-w-xl text-slate-600">
            Streamline your recruitment process with one place for candidate
            management, interview tracking, and hiring workflows.
          </p>
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8">
            <p className="text-sm text-slate-500">
              Click Manage Jobs in the sidebar to view all jobs from your
              database.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
