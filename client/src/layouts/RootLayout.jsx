import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

function RootLayout() {
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
          <SidebarItem icon="🏠" label="Dashboard" active />
          <SidebarItem icon="📊" label="Analytics" />
          <SidebarItem icon="🧠" label="AI Coach" />
          <SidebarItem icon="🏆" label="Leaderboard" />
          <SidebarItem icon="🔥" label="Daily Missions" />
          <SidebarItem icon="📅" label="Contests" />
        </nav>
        <div style={{ borderTop: "3px solid #000", paddingTop: "16px" }}>
          <SidebarItem icon="👤" label="Profile" />
          <SidebarItem icon="⚙" label="Settings" />
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

function SidebarItem({ icon, label, active }) {
  return (
    <div
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
        fontWeight: active ? 600 : 400,
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
