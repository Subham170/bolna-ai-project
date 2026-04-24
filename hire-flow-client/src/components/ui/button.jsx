export function Button({
  className = "",
  variant = "default",
  type = "button",
  children,
  ...props
}) {
  const styles =
    variant === "outline"
      ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      : "bg-blue-600 text-white hover:bg-blue-700";

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
