import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

const codeSymbols = [
  { symbol: "</>", top: "10%", right: "12%", size: 42, color: "var(--color-accent-blue)", dur: 4, op: 0.08 },
  { symbol: "{ }", bottom: "18%", left: "6%", size: 38, color: "var(--color-accent-pink)", dur: 5, op: 0.08 },
  { symbol: "#", top: "30%", left: "8%", size: 48, color: "var(--color-accent-green)", dur: 3.5, op: 0.07 },
  { symbol: "=>", bottom: "35%", right: "10%", size: 34, color: "var(--color-accent-purple)", dur: 4.5, op: 0.06 },
  { symbol: "//", top: "55%", right: "5%", size: 26, color: "var(--color-accent-green)", dur: 3.8, op: 0.05 },
  { symbol: "fn", top: "15%", left: "22%", size: 30, color: "var(--color-accent-pink)", dur: 4.2, op: 0.06 },
  { symbol: "()", bottom: "8%", right: "25%", size: 36, color: "var(--color-accent-blue)", dur: 3.2, op: 0.07 },
  { symbol: "[]", top: "45%", right: "22%", size: 32, color: "var(--color-primary)", dur: 5.2, op: 0.06 },
  { symbol: "...", bottom: "28%", left: "18%", size: 28, color: "var(--color-accent-purple)", dur: 3.6, op: 0.05 },
  { symbol: "===", top: "68%", left: "10%", size: 24, color: "var(--color-accent-pink)", dur: 4.8, op: 0.05 },
  { symbol: "&&", top: "22%", right: "28%", size: 28, color: "var(--color-accent-purple)", dur: 5.5, op: 0.06 },
  { symbol: "||", top: "50%", left: "4%", size: 24, color: "var(--color-accent-blue)", dur: 4, op: 0.05 },
  { symbol: "import", top: "40%", left: "45%", size: 18, color: "var(--color-accent-blue)", dur: 4.1, op: 0.04 },
  { symbol: "class", bottom: "5%", left: "15%", size: 20, color: "var(--color-accent-pink)", dur: 4.7, op: 0.05 },
  { symbol: "return", top: "72%", left: "28%", size: 18, color: "var(--color-primary)", dur: 5, op: 0.04 },
  { symbol: "++", top: "42%", left: "30%", size: 28, color: "var(--color-accent-green)", dur: 3.9, op: 0.06 },
  { symbol: "null", top: "48%", left: "45%", size: 22, color: "var(--color-accent-pink)", dur: 3.8, op: 0.04 },
  { symbol: "yield", bottom: "8%", right: "8%", size: 18, color: "var(--color-accent-purple)", dur: 4.8, op: 0.05 },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-surface)",
      }}
    >
      {/* Sticky Navbar */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          borderBottom: "3px solid #000",
          background: "#fff",
        }}
      >
        <Link
          to={ROUTES.landing}
          aria-label="Algoryn Home"
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "36px",
            color: "var(--color-dark)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "36px" }}>
            <span style={{ color: "var(--color-primary)" }}>A</span>lgoryn
          </span>
        </Link>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            to={ROUTES.login}
            aria-label="Login to your account"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: "14px",
              color: "var(--color-dark)",
              textDecoration: "none",
              padding: "10px 20px",
              borderRadius: "12px",
              border: "3px solid #000",
              background: "#fff",
              boxShadow: "4px 4px 0 #000",
            }}
          >
            Login
          </Link>
          <Link
            to={ROUTES.register}
            aria-label="Create a free account"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "14px",
              color: "var(--color-dark)",
              textDecoration: "none",
              padding: "10px 20px",
              borderRadius: "12px",
              border: "3px solid #000",
              background: "var(--color-primary)",
              boxShadow: "4px 4px 0 #000",
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Floating code symbols — CSS animated for performance */}
        {codeSymbols.map((item, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...(item.top !== undefined ? { top: item.top } : {}),
              ...(item.bottom !== undefined ? { bottom: item.bottom } : {}),
              ...(item.left !== undefined ? { left: item.left } : {}),
              ...(item.right !== undefined ? { right: item.right } : {}),
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: `${item.size}px`,
              color: item.color,
              opacity: 0,
              lineHeight: 1,
              pointerEvents: "none",
              whiteSpace: "nowrap",
              animation: `heroFloat ${item.dur}s ease-in-out ${item.dur * 0.15}s infinite alternate`,
            }}
          >
            {item.symbol}
          </div>
        ))}

        <style>{`
          @keyframes heroFloat {
            0%   { opacity: 0; transform: translateY(0); }
            30%  { opacity: ${0.08}; }
            70%  { opacity: ${0.08}; }
            100% { opacity: 0; transform: translateY(-20px); }
          }
        `}</style>

        <motion.h1
          variants={itemVariants}
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "clamp(36px, 6vw, 64px)",
            lineHeight: 1.1,
            margin: "0 0 16px",
            color: "var(--color-dark)",
            maxWidth: "720px",
          }}
        >
          <span style={{ color: "var(--color-accent-blue)" }}>Code</span>,
          <span style={{ background: "var(--color-primary)", padding: "0 8px", marginLeft: "8px", display: "inline-block" }}>Track</span>,
          <span style={{  marginLeft: "8px" }}>Conquer</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(18px, 2.5vw, 24px)",
            fontWeight: 600,
            color: "var(--color-dark)",
            margin: "0 0 16px",
          }}
        >
          Your Personal Developer HQ
        </motion.p>

        {/* Platform badges */}
        <motion.div
          variants={itemVariants}
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          {[
            { label: "LeetCode", color: "#FFD93D" },
            { label: "GitHub", color: "#181717" },
            { label: "CodeChef", color: "#fff" },
            { label: "Codeforces", color: "#1F8ACB" },
            { label: "GeeksforGeeks", color: "#0F9D58" },
            { label: "HackerRank", color: "#2EC866" },
          ].map((p) => (
            <span
              key={p.label}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: "9999px",
                border: "2px solid #000",
                background: p.color,
                boxShadow: "3px 3px 0 #000",
                color: ["LeetCode", "CodeChef"].includes(p.label) ? "var(--color-dark)" : "#fff",
              }}
            >
              {p.label}
            </span>
          ))}
        </motion.div>

        <motion.p
          variants={itemVariants}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(16px, 2vw, 18px)",
            color: "#666",
            margin: "0 0 16px",
            maxWidth: "520px",
            lineHeight: 1.6,
          }}
        >
          Code on LeetCode, GitHub, Codeforces. Track everything in one place.
          Get AI-powered insights. Conquer your coding goals.
        </motion.p>

        <motion.div variants={itemVariants} style={{ marginBottom: "24px" }}>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "13px",
              fontWeight: 600,
              padding: "6px 16px",
              borderRadius: "9999px",
              border: "2px solid #000",
              background: "var(--color-accent-green)",
              boxShadow: "3px 3px 0 #000",
              color: "#fff",
              display: "inline-block",
            }}
          >
            No credit card required
          </span>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link
            to={ROUTES.register}
            aria-label="Join Algoryn for free"
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
      </motion.div>
    </section>
  );
}

export default Hero;
