import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import useUIStore from "../store/uiStore";

function OnboardingLayout() {
  const step = useUIStore((state) => state.onboardingStep);
  const total = useUIStore((state) => state.totalOnboardingSteps);
  const progress = ((step + 1) / total) * 100;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "#FFF9F0",
      }}
    >
      <div style={{ width: "100%", maxWidth: "560px" }}>
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              margin: "0 0 16px",
              fontSize: "30px",
              color: "#121212",
            }}
          >
            <span style={{ color: "var(--color-primary)" }}>A</span>lgoryn
          </h2>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              color: "#888",
              margin: "0 0 12px",
            }}
          >
            Step {step + 1} / {total}
          </p>

          <div
            style={{
              width: "100%",
              height: "12px",
              borderRadius: "8px",
              border: "3px solid #000",
              background: "#fff",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                height: "100%",
                background: "#FFD93D",
                borderRadius: "6px",
              }}
            />
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}

export default OnboardingLayout;
