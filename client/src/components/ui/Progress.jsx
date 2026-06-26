import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const colorStyles = {
  primary: { track: "#F0F0F0", fill: "var(--color-primary)" },
  success: { track: "#F0F0F0", fill: "#6BCB77" },
  warning: { track: "#F0F0F0", fill: "#FFD93D" },
  error: { track: "#F0F0F0", fill: "#FF4757" },
  info: { track: "#F0F0F0", fill: "#4D96FF" },
};

const sizeStyles = {
  sm: { height: 8, fontSize: "11px" },
  md: { height: 12, fontSize: "13px" },
  lg: { height: 16, fontSize: "14px" },
};

function Progress({
  value = 0,
  max = 100,
  size = "md",
  color = "primary",
  label,
  showValue = false,
  className,
  ...props
}) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);
  const colors = colorStyles[color];
  const sizes = sizeStyles[size];

  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      {(label || showValue) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-heading)",
            fontSize: sizes.fontSize,
            fontWeight: 600,
          }}
        >
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(percent)}%</span>}
        </div>
      )}

      <div
        style={{
          width: "100%",
          height: sizes.height,
          borderRadius: "9999px",
          border: "2px solid #000",
          background: colors.track,
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            height: "100%",
            borderRadius: "9999px",
            background: colors.fill,
          }}
        />
      </div>
    </div>
  );
}

export default Progress;
