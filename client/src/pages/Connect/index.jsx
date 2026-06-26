import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import useUIStore from "../../store/uiStore";
import Button from "../../components/ui/Button";
import { PLATFORMS } from "../../services/platformService";
import { userService } from "../../services/userService";
import { ROUTES } from "../../constants/routes";

function Connect() {
  const navigate = useNavigate();
  const nextStep = useUIStore((state) => state.nextOnboardingStep);
  const [usernames, setUsernames] = useState({});
  const [connected, setConnected] = useState(new Set());
  const [connecting, setConnecting] = useState(null);

  const handleUsernameChange = (platformId, value) => {
    setUsernames((prev) => ({ ...prev, [platformId]: value }));
  };

  const handleConnect = async (platform) => {
    const username = usernames[platform.id]?.trim();
    if (!username) {
      toast.error(`Enter your ${platform.name} username`);
      return;
    }
    setConnecting(platform.id);
    try {
      await userService.connectPlatform(platform.id, username);
      setConnected((prev) => new Set(prev).add(platform.id));
      toast.success(`+50 XP for connecting ${platform.name}!`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || `Failed to connect ${platform.name}`
      );
    } finally {
      setConnecting(null);
    }
  };

  const handleContinue = () => {
    if (connected.size === 0) return;
    nextStep();
    navigate(ROUTES.import);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "22px",
          margin: "0 0 4px",
          color: "var(--color-dark)",
          textAlign: "center",
        }}
      >
        Connect Your Platforms
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: "#666",
          margin: "0 0 24px",
          textAlign: "center",
        }}
      >
        Link your coding accounts to get started.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {PLATFORMS.map((platform) => {
          const isConnected = connected.has(platform.id);
          const isLoading = connecting === platform.id;

          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "#fff",
                border: "3px solid #000",
                borderRadius: "16px",
                boxShadow: "6px 6px 0 #000",
                padding: "12px 16px",
              }}
            >
              <span style={{ fontSize: "20px", lineHeight: 1 }}>
                {platform.icon}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "var(--color-dark)",
                  minWidth: 100,
                }}
              >
                {platform.name}
              </span>
              <input
                placeholder="username"
                value={usernames[platform.id] || ""}
                onChange={(e) =>
                  handleUsernameChange(platform.id, e.target.value)
                }
                disabled={isConnected}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "2px solid #000",
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  outline: "none",
                  background: isConnected ? "#F0F0F0" : "#fff",
                }}
              />
              <button
                onClick={() => handleConnect(platform)}
                disabled={isConnected || isLoading}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "2px solid #000",
                  background: isConnected
                    ? "#6BCB77"
                    : isLoading
                      ? "#E0E0E0"
                      : "#FFD93D",
                  boxShadow: "3px 3px 0 #000",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: "12px",
                  color: isConnected ? "#fff" : "var(--color-dark)",
                  cursor: isConnected || isLoading ? "default" : "pointer",
                  opacity: isConnected || isLoading ? 0.8 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {isLoading
                  ? "..."
                  : isConnected
                    ? "Connected ✅"
                    : "Connect"}
              </button>
            </motion.div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={connected.size === 0}
        >
          Continue →
        </Button>
      </div>
    </motion.div>
  );
}

export default Connect;
