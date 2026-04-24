export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2 ${className}`}
      {...props}
    />
  );
}
