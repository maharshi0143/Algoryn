import { cn } from "../../utils/cn";

const sizeStyles = {
  sm: { size: 32, fontSize: "12px" },
  md: { size: 40, fontSize: "15px" },
  lg: { size: 56, fontSize: "20px" },
  xl: { size: 72, fontSize: "28px" },
};

const statusColors = {
  online: "#6BCB77",
  offline: "#888",
  away: "#FFD93D",
  busy: "#FF4757",
};

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function Avatar({
  src,
  name,
  size = "md",
  status,
  className,
  style,
  ...props
}) {
  const { size: pxSize, fontSize } = sizeStyles[size];

  return (
    <div
      className={cn("relative inline-flex shrink-0", className)}
      style={{
        width: pxSize,
        height: pxSize,
        ...style,
      }}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name || "Avatar"}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "16px",
            border: "3px solid #000",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "16px",
            border: "3px solid #000",
            background: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize,
            fontWeight: 700,
            fontFamily: "var(--font-heading)",
            color: "var(--color-dark)",
          }}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            width: 12,
            height: 12,
            borderRadius: "50%",
            border: "2px solid #fff",
            background: statusColors[status] || statusColors.offline,
          }}
        />
      )}
    </div>
  );
}

export default Avatar;
