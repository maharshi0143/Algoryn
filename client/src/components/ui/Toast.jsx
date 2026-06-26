import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";

const iconMap = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

const colorMap = {
  success: { border: "#6BCB77", shadow: "#6BCB77" },
  error: { border: "#FF4757", shadow: "#FF4757" },
  warning: { border: "#FFD93D", shadow: "#FFD93D" },
  info: { border: "#4D96FF", shadow: "#4D96FF" },
};

function Toast({
  message,
  type = "info",
  visible,
  onDismiss,
  duration = 3000,
  className,
  ...props
}) {
  const colors = colorMap[type];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onMouseEnter={() => {}}
          className={cn("flex items-center gap-3", className)}
          style={{
            padding: "14px 20px",
            borderRadius: "16px",
            border: "3px solid #000",
            boxShadow: `6px 6px 0 ${colors.shadow}`,
            background: "#fff",
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--color-dark)",
            cursor: "pointer",
            minWidth: 280,
          }}
          onClick={onDismiss}
          {...props}
        >
          <span style={{ fontSize: "18px" }}>{iconMap[type]}</span>
          <span style={{ flex: 1 }}>{message}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss?.();
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              color: "#888",
              padding: 0,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Toast;
