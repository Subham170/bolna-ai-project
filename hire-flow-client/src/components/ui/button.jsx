export function Button({
  className = "",
  variant = "default",
  type = "button",
  children,
  ...props
}) {
  const styles =
    variant === "outline"
      ? "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
      : "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-700 hover:to-indigo-700";

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
