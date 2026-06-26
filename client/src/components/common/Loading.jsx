import { motion } from "framer-motion";

function Loading({ text = "Loading..." }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "24px",
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "16px",
          border: "3px solid #000",
          borderTopColor: "#FFD93D",
          boxShadow: "4px 4px 0 #000",
        }}
      />
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "16px",
          color: "#666",
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}

export default Loading;
