import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useUIStore from "../../store/uiStore";
import { ROUTES } from "../../constants/routes";

const steps = [
  { label: "Initializing...", percent: 35 },
  { label: "GitHub...", percent: 50 },
  { label: "LeetCode...", percent: 70 },
  { label: "Generating AI...", percent: 85 },
  { label: "Preparing Dashboard...", percent: 100 },
];

function Import() {
  const navigate = useNavigate();
  const resetOnboarding = useUIStore((state) => state.resetOnboarding);
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    let timers = [];

    const run = async () => {
      for (let i = 0; i < steps.length; i++) {
        await new Promise((resolve) => {
          const t = setTimeout(() => {
            if (mounted.current) setCurrentStep(i + 1);
            resolve();
          }, 600 + i * 100);
          timers.push(t);
        });
      }

      await new Promise((resolve) => {
        const t = setTimeout(() => {
          if (mounted.current) setDone(true);
          resolve();
        }, 1200);
        timers.push(t);
      });

      await new Promise((resolve) => {
        const t = setTimeout(() => {
          if (mounted.current) {
            resetOnboarding();
            navigate(ROUTES.dashboard, { replace: true });
          }
          resolve();
        }, 800);
        timers.push(t);
      });
    };

    run();

    return () => {
      mounted.current = false;
      timers.forEach(clearTimeout);
    };
  }, [navigate, resetOnboarding]);

  const stepStatus = (index) => {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "current";
    return "future";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "20px",
          margin: "0 0 24px",
          color: "var(--color-dark)",
          textAlign: "center",
        }}
      >
        {done ? "All set! 🚀" : "Setting up your Developer HQ"}
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {steps.map((step, i) => {
          const status = stepStatus(i);

          return (
            <div
              key={step.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                opacity: status === "future" ? 0.25 : 1,
                transition: "opacity 0.3s",
              }}
            >
              <span
                style={{
                  width: 140,
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  color: status === "completed" ? "#6BCB77" : "var(--color-dark)",
                  fontWeight: status === "current" ? 600 : 400,
                  flexShrink: 0,
                }}
              >
                {step.label}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 10,
                  borderRadius: "6px",
                  border: "2px solid #000",
                  background: "#F0F0F0",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      status === "completed"
                        ? "100%"
                        : status === "current"
                          ? `${step.percent}%`
                          : "0%",
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    borderRadius: "4px",
                    background:
                      status === "completed" ? "#6BCB77" : "var(--color-primary)",
                  }}
                />
              </div>
              <span
                style={{
                  width: 30,
                  textAlign: "right",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "#888",
                  flexShrink: 0,
                }}
              >
                {status === "completed"
                  ? "100%"
                  : status === "current"
                    ? `${step.percent}%`
                    : "0%"}
              </span>
            </div>
          );
        })}

        {done && (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "18px",
              margin: "8px 0 0",
              color: "#6BCB77",
              textAlign: "center",
            }}
          >
            Complete! ✅
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

export default Import;
