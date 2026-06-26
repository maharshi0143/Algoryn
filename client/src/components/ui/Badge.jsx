import { cn } from "../../utils/cn";

const variantStyles = {
  success: { background: "#6BCB77", color: "#fff" },
  warning: { background: "#FFD93D", color: "#121212" },
  error: { background: "#FF4757", color: "#fff" },
  info: { background: "#4D96FF", color: "#fff" },
  neutral: { background: "#E8E8E8", color: "#666" },
};

const sizeStyles = {
  sm: { padding: "2px 8px", fontSize: "11px" },
  md: { padding: "4px 12px", fontSize: "13px" },
  lg: { padding: "6px 16px", fontSize: "15px" },
};

function Badge({
  children,
  variant = "neutral",
  size = "sm",
  className,
  style,
  ...props
}) {
  return (
    <span
      className={cn("inline-flex items-center font-heading font-semibold", className)}
      style={{
        borderRadius: "9999px",
        border: "2px solid #000",
        fontWeight: 600,
        fontFamily: "var(--font-heading)",
        whiteSpace: "nowrap",
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
