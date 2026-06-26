import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const variantStyles = {
  primary: {
    background: "var(--color-primary)",
    color: "var(--color-dark)",
  },
  secondary: {
    background: "#fff",
    color: "var(--color-dark)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-dark)",
    border: "none",
    boxShadow: "none",
  },
  danger: {
    background: "#FF4757",
    color: "#fff",
  },
};

const sizeStyles = {
  sm: { padding: "8px 16px", fontSize: "13px" },
  md: { padding: "12px 24px", fontSize: "15px" },
  lg: { padding: "16px 32px", fontSize: "17px" },
};

function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  style,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-heading font-bold cursor-pointer select-none transition-shadow duration-200",
        variant !== "ghost" && "border-[3px] border-[#000]",
        !isDisabled && variant !== "ghost" && "hover:shadow-[8px_8px_0_#000]",
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{
        borderRadius: "16px",
        boxShadow: variant === "ghost" ? "none" : "6px 6px 0 #000",
        fontWeight: 700,
        fontFamily: "var(--font-heading)",
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </motion.button>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 019.95 9"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default Button;
