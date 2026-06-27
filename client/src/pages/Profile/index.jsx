import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import { PLATFORMS } from "../../services/platformService";
import { userService } from "../../services/userService";

function Profile() {
  const [profiles, setProfiles] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await userService.getPlatforms();
      const list = res.data?.data?.data || [];
      setProfiles(list);
      const names = {};
      list.forEach((p) => { names[p.platform] = p.username; });
      setUsernames(names);
    } catch {
      toast.error("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

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
      toast.success(`${platform.name} connected!`);
      await fetchProfiles();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to connect ${platform.name}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platformName, profileId) => {
    setDeleting(profileId);
    try {
      await userService.deletePlatform(profileId);
      toast.success(`${platformName} disconnected`);
      await fetchProfiles();
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingBottom: "32px" }}>
        <Skeleton variant="text" width="200px" height={32} />
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} variant="card" height={68} />
          ))}
        </div>
      </div>
    );
  }

  const getProfileByPlatform = (platformId) =>
    profiles.find((p) => p.platform === platformId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ paddingBottom: "32px" }}
    >
      <h1 style={{
        fontFamily: "var(--font-heading)", fontWeight: 700,
        fontSize: "26px", margin: "0 0 8px", color: "var(--color-dark)",
      }}>
        👤 Profile
      </h1>
      <p style={{
        fontFamily: "var(--font-body)", fontSize: "14px",
        color: "#666", margin: "0 0 24px",
      }}>
        Manage your connected coding platforms.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {PLATFORMS.map((platform) => {
          const profile = getProfileByPlatform(platform.id);
          const isConnected = !!profile;
          const isConnecting = connecting === platform.id;
          const isDeleting = deleting === profile?.id;

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
              <span style={{ fontSize: "20px", lineHeight: 1, color: platform.color, display: "inline-flex" }}>
                <platform.icon />
              </span>
              <span style={{
                fontFamily: "var(--font-heading)", fontWeight: 600,
                fontSize: "14px", color: "var(--color-dark)", minWidth: 100,
              }}>
                {platform.name}
              </span>
              <input
                placeholder="username"
                value={usernames[platform.id] || ""}
                onChange={(e) => handleUsernameChange(platform.id, e.target.value)}
                disabled={isConnected}
                style={{
                  flex: 1, padding: "8px 12px", borderRadius: "10px",
                  border: "2px solid #000",
                  fontFamily: "var(--font-body)", fontSize: "13px",
                  outline: "none",
                  background: isConnected ? "#F0F0F0" : "#fff",
                }}
              />
              {isConnected ? (
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{
                    padding: "8px 16px", borderRadius: "10px",
                    border: "2px solid #000",
                    background: "#6BCB77",
                    boxShadow: "3px 3px 0 #000",
                    fontFamily: "var(--font-heading)", fontWeight: 700,
                    fontSize: "12px", color: "#fff",
                    whiteSpace: "nowrap",
                  }}>
                    Connected ✅
                  </span>
                  <button
                    onClick={() => handleDisconnect(platform.name, profile.id)}
                    disabled={isDeleting}
                    style={{
                      padding: "8px 16px", borderRadius: "10px",
                      border: "2px solid #000",
                      background: isDeleting ? "#E0E0E0" : "#FF4757",
                      boxShadow: "3px 3px 0 #000",
                      fontFamily: "var(--font-heading)", fontWeight: 700,
                      fontSize: "12px",
                      color: "#fff",
                      cursor: isDeleting ? "default" : "pointer",
                      opacity: isDeleting ? 0.8 : 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isDeleting ? "..." : "Disconnect ✕"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(platform)}
                  disabled={isConnecting}
                  style={{
                    padding: "8px 16px", borderRadius: "10px",
                    border: "2px solid #000",
                    background: isConnecting ? "#E0E0E0" : "#FFD93D",
                    boxShadow: "3px 3px 0 #000",
                    fontFamily: "var(--font-heading)", fontWeight: 700,
                    fontSize: "12px",
                    color: isConnecting ? "#888" : "var(--color-dark)",
                    cursor: isConnecting ? "default" : "pointer",
                    opacity: isConnecting ? 0.8 : 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {isConnecting ? "..." : "Connect"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default Profile;
