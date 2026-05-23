const variants = {
  primary: "bg-zinc-950 text-white hover:bg-zinc-800 disabled:bg-zinc-300",
  secondary: "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 disabled:text-zinc-400",
  ghost: "text-zinc-700 hover:bg-zinc-100 disabled:text-zinc-400",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:text-red-300",
};

export default function Button({
  children,
  icon: Icon,
  iconClassName = "",
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon ? <Icon aria-hidden="true" className={`h-4 w-4 shrink-0 ${iconClassName}`} /> : null}
      <span className="truncate">{children}</span>
    </button>
  );
}
