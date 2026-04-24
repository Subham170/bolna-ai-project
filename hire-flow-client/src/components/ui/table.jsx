export function Table({ className = "", children }) {
  return (
    <div className={`w-full overflow-auto ${className}`}>
      <table className="w-full caption-bottom text-sm">{children}</table>
    </div>
  );
}

export function TableHeader({ className = "", children }) {
  return <thead className={`border-b bg-slate-50 ${className}`}>{children}</thead>;
}

export function TableBody({ className = "", children }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ className = "", children }) {
  return (
    <tr className={`border-b transition-colors hover:bg-slate-50/60 ${className}`}>
      {children}
    </tr>
  );
}

export function TableHead({ className = "", children }) {
  return (
    <th
      className={`h-11 px-4 text-left align-middle text-xs font-semibold text-slate-600 ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ className = "", children }) {
  return <td className={`p-4 align-middle text-slate-700 ${className}`}>{children}</td>;
}
