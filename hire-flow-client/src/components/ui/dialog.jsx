export function Dialog({ open, children }) {
  if (!open) return null;
  return <>{children}</>;
}

export function DialogOverlay({ onClick }) {
  return <div className="fixed inset-0 z-40 bg-black/40" onClick={onClick} />;
}

export function DialogContent({ className = "", children }) {
  return (
    <div
      className={`fixed left-1/2 top-1/2 z-50 w-[95%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ className = "", children }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function DialogTitle({ className = "", children }) {
  return <h2 className={`text-xl font-semibold text-slate-900 ${className}`}>{children}</h2>;
}
