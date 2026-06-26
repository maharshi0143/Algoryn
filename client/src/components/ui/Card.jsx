import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const paddingStyles = {
  none: { padding: 0 },
  sm: { padding: "16px" },
  md: { padding: "24px" },
  lg: { padding: "32px" },
};

function Card({
  children,
  variant = "default",
  padding = "md",
  className,
  style,
  onClick,
  ...props
}) {
  const isClickable = variant === "clickable" || onClick;

  const Component = isClickable ? motion.button : motion.div;

  return (
    <Component
      whileHover={
        isClickable || variant === "hoverable"
          ? { y: -4, boxShadow: "8px 8px 0 #000" }
          : {}
      }
      whileTap={isClickable ? { scale: 0.98, boxShadow: "3px 3px 0 #000" } : {}}
      onClick={onClick}
      className={cn(
        "border-[3px] border-[#000] bg-white text-left",
        isClickable && "cursor-pointer",
        className
      )}
      style={{
        borderRadius: "16px",
        boxShadow: "6px 6px 0 #000",
        background: "#fff",
        ...paddingStyles[padding],
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Card;
