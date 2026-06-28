import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES } from "../constants/routes";
import { notificationService } from "../services/notificationService";

function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        setUnreadCount(res.data?.data?.count ?? 0);
      } catch {
        // ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#FFF9F0",
      }}
    >
      <div
        style={{
          width: "260px",
          borderRight: "3px solid #000",
          background: "#fff",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          overflowY: "auto",
          zIndex: 50,
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              margin: 0,
              fontSize: "28px",
            }}
          >
            <span style={{ color: "var(--color-primary)" }}>A</span>lgoryn
          </h2>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          <SidebarItem icon="🏠" label="Dashboard" active={isActive(ROUTES.dashboard)} onClick={() => navigate(ROUTES.dashboard)} />
          <SidebarItem icon="📊" label="Analytics" active={isActive(ROUTES.analytics)} onClick={() => navigate(ROUTES.analytics)} />
          <SidebarItem icon="🏆" label="Leaderboard" active={isActive(ROUTES.leaderboard)} onClick={() => navigate(ROUTES.leaderboard)} />
          <SidebarItem icon="📅" label="Contests" active={isActive(ROUTES.contests)} onClick={() => navigate(ROUTES.contests)} />
          <SidebarItem icon="⭐" label="Achievements" active={isActive(ROUTES.achievements)} onClick={() => navigate(ROUTES.achievements)} />
          <SidebarItem icon="🤖" label="AI Coach" active={isActive(ROUTES.aiCoach)} onClick={() => navigate(ROUTES.aiCoach)} />
        </nav>
        <div style={{ borderTop: "3px solid #000", paddingTop: "16px" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <SidebarItem icon="🔔" label="Notifications" active={isActive(ROUTES.notifications)} onClick={() => navigate(ROUTES.notifications)} />
            </div>
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
                background: "#FF4757", color: "#fff", borderRadius: "50%",
                minWidth: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "11px",
                border: "2px solid #000", lineHeight: 1,
              }}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <SidebarItem icon="👥" label="Friends" active={isActive(ROUTES.friends)} onClick={() => navigate(ROUTES.friends)} />
          <SidebarItem icon="🎯" label="Goals" active={isActive(ROUTES.goals)} onClick={() => navigate(ROUTES.goals)} />
          <SidebarItem icon="👤" label="Profile" active={isActive(ROUTES.profile)} onClick={() => navigate(ROUTES.profile)} />
          <SidebarItem icon="⚙" label="Settings" active={isActive(ROUTES.settings)} onClick={() => navigate(ROUTES.settings)} />
        </div>
      </div>

      <div style={{ marginLeft: "260px", flex: 1, padding: "32px" }}>
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "12px",
        border: active ? "3px solid #000" : "3px solid transparent",
        background: active ? "#FFD93D" : "transparent",
        boxShadow: active ? "4px 4px 0 #000" : "none",
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        fontSize: "15px",
        transition: "all 0.2s",
        color: "#121212",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.border = "3px solid #000";
          e.currentTarget.style.boxShadow = "4px 4px 0 #000";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.border = "3px solid transparent";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

export default RootLayout;
