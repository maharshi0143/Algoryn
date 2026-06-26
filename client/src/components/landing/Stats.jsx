import { useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

const stats = [
  { label: "Active Users", value: 128, suffix: "+" },
  { label: "Problems Solved", value: 3420, suffix: "+" },
  { label: "Day Streaks", value: 89, suffix: "+" },
];

function AnimatedNumber({ value }) {
  const spring = useSpring(0, { damping: 30, stiffness: 100 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  spring.set(value);

  return <motion.span>{display}</motion.span>;
}

function StatCard({ label, value, suffix, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      style={{
        flex: "1 1 180px",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "clamp(36px, 5vw, 52px)",
          color: "var(--color-primary)",
          textShadow: "0 0 20px rgba(255,217,61,0.3), 0 0 40px rgba(255,217,61,0.15)",
          marginBottom: "4px",
        }}
      >
        {inView ? (
          <>
            <AnimatedNumber value={value} />
            {suffix}
          </>
        ) : (
          <>
            0{suffix}
          </>
        )}
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "16px",
          color: "#aaa",
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}

function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      style={{
        padding: "64px 24px",
        background: "var(--color-dark)",
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
          color: "#fff",
        }}
      >
        Built by developers, for developers
      </motion.h2>

      <div
        style={{
          display: "flex",
          gap: "24px",
          maxWidth: "800px",
          margin: "0 auto",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} index={i} />
        ))}
      </div>
    </section>
  );
}

export default Stats;
