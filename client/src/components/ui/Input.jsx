import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    className,
    containerClassName,
    ...props
  },
  ref
) {
  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: "14px",
            color: "var(--color-dark)",
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: "relative" }}>
        {Icon && (
          <span
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#888",
              display: "flex",
            }}
          >
            {typeof Icon === "function" ? <Icon size={18} /> : Icon}
          </span>
        )}

        <motion.input
          ref={ref}
          whileFocus={{ scale: 1.01 }}
          className={cn(
            "w-full font-body text-[15px] outline-none transition-shadow duration-200",
            Icon && "pl-[46px]",
            className
          )}
          style={{
            padding: Icon ? "14px 46px 14px 46px" : "14px 16px",
            borderRadius: "16px",
            border: error ? "3px solid #FF4757" : "3px solid #000",
            boxShadow: error
              ? "4px 4px 0 #FF4757"
              : "4px 4px 0 #000",
            background: "#fff",
            color: "var(--color-dark)",
          }}
          {...props}
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#FF4757",
            fontFamily: "var(--font-body)",
          }}
        >
          {error}
        </motion.p>
      )}

      {helperText && !error && (
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#888",
            fontFamily: "var(--font-body)",
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
