import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";

const positionStyles = {
  top: { bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
  bottom: { top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
  left: { right: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
  right: { left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
};

const arrowPositionStyles = {
  top: { bottom: -6, left: "50%", transform: "translateX(-50%) rotate(45deg)" },
  bottom: { top: -6, left: "50%", transform: "translateX(-50%) rotate(45deg)" },
  left: { right: -6, top: "50%", transform: "translateY(-50%) rotate(45deg)" },
  right: { left: -6, top: "50%", transform: "translateY(-50%) rotate(45deg)" },
};

function Tooltip({
  content,
  children,
  position = "top",
  delay = 200,
  className,
  ...props
}) {
  const [visible, setVisible] = useState(false);
  let timeout = null;

  const handleMouseEnter = () => {
    timeout = setTimeout(() => setVisible(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeout);
    setVisible(false);
  };

  return (
    <div
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "absolute",
              zIndex: 100,
              pointerEvents: "none",
              ...positionStyles[position],
            }}
          >
            <div
              className={cn("font-body text-sm whitespace-nowrap", className)}
              style={{
                background: "var(--color-dark)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "2px solid #000",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
              }}
            >
              {content}
            </div>
            <div
              style={{
                position: "absolute",
                width: 10,
                height: 10,
                background: "var(--color-dark)",
                border: "2px solid #000",
                ...arrowPositionStyles[position],
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Tooltip;
