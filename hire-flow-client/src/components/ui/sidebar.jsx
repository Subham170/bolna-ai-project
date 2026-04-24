export function Sidebar({ className = "", children }) {
  return (
    <aside
      className={`w-64 shrink-0 border-r border-slate-200 bg-slate-100/80 ${className}`}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ className = "", children }) {
  return (
    <div className={`border-b border-slate-200 px-5 py-6 ${className}`}>{children}</div>
  );
}

export function SidebarContent({ className = "", children }) {
  return <div className={`px-3 py-4 ${className}`}>{children}</div>;
}

export function SidebarMenu({ className = "", children }) {
  return <ul className={`space-y-1 ${className}`}>{children}</ul>;
}

export function SidebarMenuItem({ children }) {
  return <li>{children}</li>;
}

export function SidebarMenuButton({
  className = "",
  isActive = false,
  children,
  ...props
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
        isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-700 hover:bg-slate-200/80"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
