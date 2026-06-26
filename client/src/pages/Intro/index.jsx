import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useUIStore from "../../store/uiStore";
import Button from "../../components/ui/Button";
import { ROUTES } from "../../constants/routes";

const cards = [
  {
    icon: "📊",
    title: "Track Everything",
    desc: "Sync LeetCode, Codeforces, GitHub, and more. One dashboard to rule them all.",
    accent: "var(--color-accent-blue)",
  },
  {
    icon: "🤖",
    title: "Meet AI Coach",
    desc: "Groq-powered insights that tell you exactly what to improve and how.",
    accent: "var(--color-accent-purple)",
  },
  {
    icon: "🏆",
    title: "Become Better",
    desc: "Ranks, achievements, streaks, and XP. We turned coding into a game.",
    accent: "var(--color-accent-pink)",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.15, ease: "easeOut" },
  }),
};

function Intro() {
  const navigate = useNavigate();
  const nextStep = useUIStore((state) => state.nextOnboardingStep);

  const handleContinue = () => {
    nextStep();
    navigate(ROUTES.connect);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "16px",
            background: "#fff",
            border: "3px solid #000",
            borderRadius: "16px",
            boxShadow: "6px 6px 0 #000",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              minWidth: 48,
              borderRadius: "12px",
              border: "3px solid #000",
              background: card.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            {card.icon}
          </div>
          <div>
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "16px",
                margin: "0 0 4px",
                color: "var(--color-dark)",
              }}
            >
              {card.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "#666",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {card.desc}
            </p>
          </div>
        </motion.div>
      ))}

      <div style={{ textAlign: "center", marginTop: "8px" }}>
        <Button size="lg" onClick={handleContinue}>
          Continue →
        </Button>
      </div>
    </motion.div>
  );
}

export default Intro;
