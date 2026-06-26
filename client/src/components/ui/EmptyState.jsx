import { cn } from "../../utils/cn";

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        className
      )}
      style={{
        padding: "48px 24px",
        borderRadius: "16px",
        border: "3px dashed #D0D0D0",
        background: "#FAFAFA",
      }}
      {...props}
    >
      {icon && (
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>{icon}</div>
      )}

      {title && (
        <h3
          style={{
            margin: "0 0 8px",
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "18px",
            color: "var(--color-dark)",
          }}
        >
          {title}
        </h3>
      )}

      {description && (
        <p
          style={{
            margin: "0 0 24px",
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            color: "#888",
            maxWidth: 360,
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;
