export function Table({ className = "", children }) {
  return (
    <div className={`w-full overflow-auto ${className}`}>
      <table className="w-full min-w-[760px] caption-bottom text-sm">{children}</table>
    </div>
  );
}

export function TableHeader({ className = "", children }) {
  return <thead className={`border-b border-slate-200 bg-slate-50/90 ${className}`}>{children}</thead>;
}

export function TableBody({ className = "", children }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ className = "", children }) {
  return (
    <tr className={`border-b border-slate-100 transition-colors hover:bg-blue-50/40 ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ className = "", children }) {
  return (
    <th
      className={`h-11 px-4 text-left align-middle text-xs font-semibold tracking-wide text-slate-500 ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ className = "", children }) {
  return <td className={`p-4 align-middle text-[13px] text-slate-700 ${className}`}>{children}</td>;
}
