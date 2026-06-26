import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      style={{
        padding: "80px 24px",
        background: "var(--color-dark)",
        borderTop: "3px solid #000",
        textAlign: "center",
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "clamp(28px, 4vw, 40px)",
          color: "#fff",
          margin: "0 0 12px",
        }}
      >
        Ready to Level Up? 🚀
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "16px",
          color: "#aaa",
          margin: "0 0 32px",
          maxWidth: "440px",
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.6,
        }}
      >
        Join developers who are already tracking, improving, and conquering
        their coding goals.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Link
          to={ROUTES.register}
          style={{
            display: "inline-block",
            padding: "16px 48px",
            borderRadius: "16px",
            border: "3px solid #000",
            background: "var(--color-primary)",
            boxShadow: "6px 6px 0 #000",
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "18px",
            cursor: "pointer",
            color: "var(--color-dark)",
            textDecoration: "none",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translate(-2px, -2px)";
            e.currentTarget.style.boxShadow = "8px 8px 0 #000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translate(0, 0)";
            e.currentTarget.style.boxShadow = "6px 6px 0 #000";
          }}
        >
          Join the Club ⚡
        </Link>
      </motion.div>
    </section>
  );
}

export default CTA;
