import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function GridIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M9 21h6" />
      <path d="M12 3a5 5 0 0 0-5 5c0 2.5 1.5 4.5 3 5.5V16h4v-2.5c1.5-1 3-3 3-5.5a5 5 0 0 0-5-5Z" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
      <path d="M12 15v5" />
      <path d="M8 21h8" />
      <path d="M6 9a6 6 0 0 0 12 0" />
    </svg>
  );
}

const features = [
  {
    icon: GridIcon,
    title: "Track Everything",
    description:
      "Sync your LeetCode, Codeforces, GitHub, and more. One dashboard to rule all your coding activity.",
    accent: "var(--color-accent-blue)",
  },
  {
    icon: LightbulbIcon,
    title: "AI Coach",
    description:
      "Groq-powered insights on your performance. Know exactly what to improve and how to get there.",
    accent: "var(--color-accent-purple)",
  },
  {
    icon: TrophyIcon,
    title: "Become Better",
    description:
      "Streaks, XP, leaderboards, and contests. We turned competitive programming into a game.",
    accent: "var(--color-accent-pink)",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.15, ease: "easeOut" },
  }),
};

function TiltCard({ children, className, style, ...props }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 10, y: y * -10 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 800,
        ...style,
      }}
    >
      <motion.div
        animate={{ rotateX: tilt.y, rotateY: tilt.x }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div
          style={{
            borderRadius: "16px",
            border: "3px solid #000",
            boxShadow: "6px 6px 0 #000",
            background: "#fff",
            padding: "32px 24px",
            height: "100%",
          }}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      style={{
        padding: "80px 24px",
        background: "#fff",
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
        How Algoryn Works
      </motion.h2>

      <div
        style={{
          display: "flex",
          gap: "24px",
          maxWidth: "960px",
          margin: "0 auto",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "stretch",
          position: "relative",
        }}
      >
        {/* Connector line */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "calc(16.66% + 80px)",
            right: "calc(16.66% + 80px)",
            height: 0,
            borderTop: "3px dashed #D0D0D0",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {features.map((feature, i) => (
          <TiltCard
            key={feature.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{
              flex: "1 1 260px",
              maxWidth: "320px",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                border: "3px solid #000",
                background: feature.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <feature.icon />
            </div>

            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "18px",
                margin: "0 0 8px",
                color: "var(--color-dark)",
              }}
            >
              {feature.title}
            </h3>

            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "#666",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {feature.description}
            </p>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}

export default Features;
