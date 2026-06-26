import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuthStore from "../../store/authStore";
import useUIStore from "../../store/uiStore";
import Button from "../../components/ui/Button";
import { ROUTES } from "../../constants/routes";

function Welcome() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const nextStep = useUIStore((state) => state.nextOnboardingStep);

  const handleContinue = () => {
    nextStep();
    navigate(ROUTES.intro);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "36px",
          color: "var(--color-dark)",
          margin: "0 0 12px",
          lineHeight: 1.2,
        }}
      >
        Welcome{user ? `, ${user.name}` : ""} 👋
      </p>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "16px",
          color: "#666",
          margin: "0 0 40px",
          lineHeight: 1.6,
        }}
      >
        Let&apos;s build your Developer HQ.
      </p>
      <Button size="lg" onClick={handleContinue}>
        Continue →
      </Button>
    </motion.div>
  );
}

export default Welcome;
