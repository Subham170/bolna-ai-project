export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2 ${className}`}
      {...props}
    />
  );
}
