export function Sidebar({ className = "", children }) {
  return (
    <aside
      className={`w-full shrink-0 border-b border-slate-200 bg-white md:w-64 md:border-b-0 md:border-r ${className}`}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ className = "", children }) {
  return (
    <div className={`border-b border-slate-200 px-4 py-4 md:px-5 md:py-6 ${className}`}>{children}</div>
  );
}

export function SidebarContent({ className = "", children }) {
  return <div className={`overflow-x-auto px-2 py-3 md:px-3 md:py-4 ${className}`}>{children}</div>;
}

export function SidebarMenu({ className = "", children }) {
  return <ul className={`flex min-w-max gap-2 md:block md:min-w-0 md:space-y-1 ${className}`}>{children}</ul>;
}

export function SidebarMenuItem({ children }) {
  return <li className="shrink-0 md:shrink">{children}</li>;
}

export function SidebarMenuButton({
  className = "",
  isActive = false,
  children,
  ...props
}) {
  return (
    <button
      className={`flex w-auto items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors md:w-full md:gap-3 md:text-sm ${
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
