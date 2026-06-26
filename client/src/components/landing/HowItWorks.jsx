import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  { num: 1, title: "Sign Up", desc: "Create your free account in seconds.", color: "var(--color-accent-blue)" },
  { num: 2, title: "Connect", desc: "Link LeetCode, GitHub, Codeforces, and more.", color: "var(--color-accent-green)" },
  { num: 3, title: "Code", desc: "Keep solving problems. We track everything.", color: "var(--color-primary)" },
  { num: 4, title: "Level Up", desc: "Get AI insights, earn XP, climb the leaderboard.", color: "var(--color-accent-pink)" },
];

function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      style={{
        padding: "80px 24px",
        background: "var(--color-surface)",
        borderTop: "3px solid #000",
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "clamp(28px, 4vw, 36px)",
          textAlign: "center",
          margin: "0 0 48px",
          color: "var(--color-dark)",
        }}
      >
        Get Started in 4 Steps
      </motion.h2>

      <div
        style={{
          display: "flex",
          gap: "16px",
          maxWidth: "860px",
          margin: "0 auto",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "flex-start",
          position: "relative",
        }}
      >
        {/* Connector line */}
        <div
          style={{
            position: "absolute",
            top: "30px",
            left: "60px",
            right: "60px",
            height: 0,
            borderTop: "3px dashed #D0D0D0",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.15 }}
            style={{
              flex: "1 1 160px",
              maxWidth: "200px",
              textAlign: "center",
              zIndex: 1,
            }}
          >
            {/* Step number circle */}
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "3px solid #000",
                background: step.color,
                boxShadow: "4px 4px 0 #000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "22px",
                color: "#121212",
              }}
            >
              {step.num}
            </div>

            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "16px",
                margin: "0 0 6px",
                color: "var(--color-dark)",
              }}
            >
              {step.title}
            </h3>

            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "#888",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;
