import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { dashboardService } from "../../services/dashboardService";
import { ROUTES } from "../../constants/routes";
import {
  SolvedIcon, EasyIcon, MediumIcon, HardIcon,
  StreakIcon, RepoIcon, FollowersIcon, ContributionsIcon,
} from "./DashboardIcons";

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let current = 0;
    const step = Math.max(1, Math.ceil(value / 30));
    const timer = setInterval(() => {
      current += step;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else setDisplay(current);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{display}</span>;
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

const STATS_CONFIG = [
  { key: "totalSolved",   label: "Total Solved",  icon: <SolvedIcon />,         color: "#FFD93D", section: "problems" },
  { key: "easy",          label: "Easy",           icon: <EasyIcon />,           color: "#6BCB77", section: "problems" },
  { key: "medium",        label: "Medium",         icon: <MediumIcon />,         color: "#FF9F43", section: "problems" },
  { key: "hard",          label: "Hard",           icon: <HardIcon />,           color: "#FF4757", section: "problems" },
  { key: "streak",        label: "Streak",          icon: <StreakIcon />,        color: "#FF6B35", section: "github" },
  { key: "repositories",  label: "Repositories",    icon: <RepoIcon />,          color: "#4D96FF", section: "github" },
  { key: "followers",     label: "Followers",       icon: <FollowersIcon />,     color: "#A855F7", section: "github" },
  { key: "contributions", label: "Contributions",   icon: <ContributionsIcon />, color: "#14B8A6", section: "github" },
];

const SECTIONS = [
  { key: "problems", label: "Problems" },
  { key: "github",   label: "GitHub & Streak" },
];

function EmptyState({ onConnect }) {
  return (
    <Card padding="lg" style={{ textAlign: "center", marginTop: "24px" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>📡</div>
      <h2 style={{
        fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "22px",
        margin: "0 0 8px", color: "var(--color-dark)",
      }}>
        No data yet
      </h2>
      <p style={{
        fontFamily: "var(--font-body)", fontSize: "14px", color: "#666",
        margin: "0 auto 24px", maxWidth: "400px",
      }}>
        Connect your coding profiles to see your stats come to life.
      </p>
      <Button onClick={onConnect}>Connect Platforms →</Button>
    </Card>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const columns = isMobile ? 2 : 4;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: dashboardService.getStats,
  });

  const stats = data?.data?.data;
  const isEmpty = stats && Object.values(stats).every((v) => v === 0);

  const grid = { ...gridStyle, gridTemplateColumns: `repeat(${columns}, 1fr)` };

  if (isLoading) {
    return (
      <div style={{ paddingBottom: "32px" }}>
        <h1 style={titleStyle}>⚡ Dashboard</h1>
        <div style={grid}>
          {Array.from({ length: 8 }, (_, i) => (
            <Card key={i} padding="md">
              <div style={cardContentStyle}>
                <div className="animate-pulse" style={{ width: 28, height: 28, borderRadius: "50%", background: "#E8E8E8" }} />
                <div className="animate-pulse" style={{ width: 60, height: 32, borderRadius: "8px", background: "#E8E8E8" }} />
                <div className="animate-pulse" style={{ width: 90, height: 14, borderRadius: "8px", background: "#E8E8E8" }} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ paddingBottom: "32px" }}>
        <h1 style={titleStyle}>⚡ Dashboard</h1>
        <Card padding="md" style={{ textAlign: "center", marginTop: "24px" }}>
          <div style={{ border: "3px solid #FF4757", borderRadius: "16px", padding: "24px" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#FF4757", margin: "0 0 12px" }}>
              {error?.response?.data?.message || error?.message || "Failed to load dashboard"}
            </p>
            <button onClick={refetch} style={retryStyle}>Retry</button>
          </div>
        </Card>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div style={{ paddingBottom: "32px" }}>
        <h1 style={titleStyle}>⚡ Dashboard</h1>
        <EmptyState onConnect={() => navigate(ROUTES.connect)} />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: "32px" }}>
      <h1 style={titleStyle}>⚡ Dashboard</h1>
      {SECTIONS.map((section, sIdx) => {
        const items = STATS_CONFIG.filter((s) => s.section === section.key);
        return (
          <div key={section.key}>
            <h2 style={sectionHeaderStyle}>{section.label}</h2>
            <motion.div
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 + sIdx * 0.4 } },
              }}
              initial="hidden"
              animate="show"
              style={grid}
            >
              {items.map((stat) => (
                <motion.div
                  key={stat.key}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 180, damping: 18 } },
                  }}
                >
                  <Card padding="md">
                    <div style={{ display: "flex", gap: "14px", alignItems: "stretch" }}>
                      <div style={{ width: "4px", borderRadius: "4px", background: stat.color, flexShrink: 0 }} />
                      <div style={cardContentStyle}>
                        {stat.icon}
                        <span style={{ ...numberStyle, color: stat.color }}>
                          <AnimatedNumber value={stats[stat.key] ?? 0} />
                        </span>
                        <span style={labelStyle}>{stat.label}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

const titleStyle = {
  fontFamily: "var(--font-heading)",
  fontWeight: 700,
  fontSize: "28px",
  margin: "0 0 8px",
  color: "var(--color-dark)",
};

const sectionHeaderStyle = {
  fontFamily: "var(--font-heading)",
  fontWeight: 600,
  fontSize: "16px",
  color: "#888",
  margin: "24px 0 12px",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
};

const gridStyle = {
  display: "grid",
  gap: "16px",
};

const cardContentStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
  textAlign: "center",
  flex: 1,
};

const numberStyle = {
  fontFamily: "var(--font-heading)",
  fontWeight: 700,
  fontSize: "32px",
  lineHeight: 1,
};

const labelStyle = {
  fontFamily: "var(--font-body)",
  fontSize: "13px",
  color: "#666",
  lineHeight: 1.2,
};

const retryStyle = {
  padding: "8px 24px",
  borderRadius: "12px",
  border: "3px solid #000",
  background: "#FFD93D",
  fontFamily: "var(--font-heading)",
  fontWeight: 700,
  fontSize: "14px",
  cursor: "pointer",
  boxShadow: "4px 4px 0 #000",
};

export default Dashboard;
