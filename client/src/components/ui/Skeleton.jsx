import { cn } from "../../utils/cn";

const variantStyles = {
  text: { width: "100%", height: 14, borderRadius: "8px" },
  card: { width: "100%", height: 120, borderRadius: "16px" },
  avatar: { width: 40, height: 40, borderRadius: "16px" },
  chart: { width: "100%", height: 180, borderRadius: "16px" },
};

function Skeleton({
  variant = "text",
  width,
  height,
  className,
  count = 1,
  ...props
}) {
  const base = variantStyles[variant] || variantStyles.text;

  const bars = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={cn("animate-pulse", className)}
      style={{
        width: width || base.width,
        height: height || base.height,
        borderRadius: base.borderRadius,
        background: "#E8E8E8",
        border: "2px solid #D0D0D0",
        marginBottom: count > 1 ? "8px" : 0,
      }}
      {...props}
    />
  ));

  return <div style={{ display: "flex", flexDirection: "column" }}>{bars}</div>;
}

export default Skeleton;
