import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import usePageTitle from "../../hooks/usePageTitle";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { dashboardService, DASHBOARD_QUERY_KEY } from "../../services/dashboardService";
import { platformService } from "../../services/platformService";
import { activityLogService } from "../../services/activityLogService";
import { dailyStatsService } from "../../services/dailyStatsService";
import { ROUTES } from "../../constants/routes";
import {
  StreakIcon, RepoIcon, FollowersIcon, ContributionsIcon,
} from "./DashboardIcons";

function AnimatedNumber({ value, suffix = "" }) {
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

  return <span>{display}{suffix}</span>;
}

function GreetingBanner({ name, onSync, syncing }) {
  const hour = new Date().getHours();
  let greeting = "Good Evening";
  let emoji = "🌙";
  if (hour < 12) { greeting = "Good Morning"; emoji = "🔥"; }
  else if (hour < 17) { greeting = "Good Afternoon"; emoji = "☀️"; }

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: "16px", flexWrap: "wrap", gap: "12px",
    }}>
      <h1 style={{
        fontFamily: "var(--font-heading)", fontWeight: 700,
        fontSize: "26px", margin: 0, color: "var(--color-dark)",
      }}>
        {emoji} {greeting}, {name}
      </h1>
      <Button
        size="sm"
        loading={syncing}
        onClick={onSync}
        style={{ whiteSpace: "nowrap" }}
      >
        ⟳ Sync Now
      </Button>
    </div>
  );
}

function AIMiniWidget({ onClaimXp, claiming, claimed, todaySolved }) {
  const canClaim = todaySolved > 0 && !claimed;
  return (
    <Card padding="md" style={{
      marginBottom: "24px",
      background: claimed ? "#E8FFE8" : "linear-gradient(135deg, #FFF3CD 0%, #FFE5A0 100%)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "28px" }}>{claimed ? "✅" : todaySolved > 0 ? "🧠" : "📡"}</span>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: "var(--font-heading)", fontWeight: 700,
            fontSize: "15px", margin: "0 0 2px", color: "var(--color-dark)",
          }}>
            {claimed ? "Today's XP Claimed!" : todaySolved > 0 ? "Today's Mission" : "Sync Your Progress"}
          </p>
          <p style={{
            fontFamily: "var(--font-body)", fontSize: "13px",
            margin: 0, color: "#665",
          }}>
            {claimed
              ? `Great work! You earned XP for ${todaySolved} problem${todaySolved !== 1 ? "s" : ""} solved today.`
              : todaySolved > 0
                ? <>You solved <strong>{todaySolved}</strong> problem{todaySolved !== 1 ? "s" : ""} today — claim your XP!</>
                : "Sync your coding platforms to track daily progress and earn XP."}
          </p>
        </div>
        {canClaim && (
          <div
            onClick={onClaimXp}
            style={{
              background: claiming ? "#aaa" : "#6BCB77", color: "#fff",
              borderRadius: "12px", padding: "8px 16px",
              fontFamily: "var(--font-heading)", fontWeight: 700,
              fontSize: "12px", border: "2px solid #000",
              whiteSpace: "nowrap", cursor: claiming ? "not-allowed" : "pointer",
            }}
          >
            {claiming ? "..." : "Claim XP →"}
          </div>
        )}
      </div>
    </Card>
  );
}

function StatCard({ icon, value, label, color, suffix = "" }) {
  return (
    <Card padding="md">
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "8px", textAlign: "center",
      }}>
        <div style={{ color, fontSize: "24px", lineHeight: 1, display: "inline-flex" }}>
          {icon}
        </div>
        <span style={{
          fontFamily: "var(--font-heading)", fontWeight: 700,
          fontSize: "30px", lineHeight: 1, color,
        }}>
          <AnimatedNumber value={value} suffix={suffix} />
        </span>
        <span style={{
          fontFamily: "var(--font-body)", fontSize: "13px",
          color: "#888", lineHeight: 1.2,
        }}>
          {label}
        </span>
      </div>
    </Card>
  );
}

function XPIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L15 9L22 9.5L17 14L18.5 21L12 17L5.5 21L7 14L2 9.5L9 9L12 2Z" fill="#FFD93D" stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function LevelIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="4" height="10" rx="1" fill="#4D96FF" stroke="#000" strokeWidth="1.5"/>
      <rect x="10" y="7" width="4" height="14" rx="1" fill="#4D96FF" stroke="#000" strokeWidth="1.5"/>
      <rect x="17" y="3" width="4" height="18" rx="1" fill="#4D96FF" stroke="#000" strokeWidth="1.5"/>
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <path d="M12 2s-4 5-4 8a4 4 0 0 0 8 0c0-3-4-8-4-8z" fill="#FF6B35" stroke="#000" strokeWidth="1.5"/>
      <circle cx="12" cy="10" r="2" fill="#FF6B35" stroke="#000" strokeWidth="1"/>
    </svg>
  );
}

function ProblemsIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="16 8 10 16 8 12"/>
    </svg>
  );
}

function LevelBadge({ level }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: "4px",
      background: "linear-gradient(135deg, #FFD93D, #FF9F43)",
      borderRadius: "12px", border: "2px solid #000",
      padding: "4px 14px",
      fontFamily: "var(--font-heading)", fontWeight: 700,
      fontSize: "13px", color: "#121212",
    }}>
      <span style={{ fontSize: "16px" }}>⭐</span>
      Lvl {level}
    </div>
  );
}

function ActivityFeed({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "24px 0",
        fontFamily: "var(--font-body)", fontSize: "13px", color: "#aaa",
      }}>
        No recent activity yet
      </div>
    );
  }

  const actionIcons = {
    sync_github: "🐙",
    sync_leetcode: "💻",
    sync_codeforces: "⚡",
    sync_codechef: "🍴",
    sync_gfg: "📚",
    sync_hackerrank: "🏴",
    profile_connected: "🔗",
    achievement_unlocked: "🏆",
    default: "📌",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {activities.map((act, i) => (
        <motion.div
          key={act.id || i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "8px 12px",
            background: "#F8F8F8",
            borderRadius: "12px", border: "2px solid #E8E8E8",
          }}
        >
          <span style={{ fontSize: "18px" }}>
            {actionIcons[act.action] || actionIcons.default}
          </span>
          <span style={{
            fontFamily: "var(--font-body)", fontSize: "13px", flex: 1,
            color: "#444",
          }}>
            {act.metadata?.description || act.action}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "11px", color: "#aaa",
            whiteSpace: "nowrap",
          }}>
            {act.created_at ? format(parseISO(act.created_at), "MMM d, HH:mm") : ""}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

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

const STAT_CARDS = [
  { key: "xp",        label: "XP",                icon: null,               color: "#FFD93D" },
  { key: "level",     label: "Level",             icon: null,               color: "#4D96FF" },
  { key: "streak",    label: "Fire Streak",        icon: <StreakIcon />,    color: "#FF6B35" },

  { key: "repositories", label: "Repositories",    icon: <RepoIcon />,      color: "#4D96FF" },
  { key: "followers", label: "Followers",           icon: <FollowersIcon />, color: "#A855F7" },
  { key: "contributions", label: "Contributions",   icon: <ContributionsIcon />, color: "#14B8A6" },
];

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

function Dashboard() {
  usePageTitle("Dashboard");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [syncing, setSyncing] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [activityData, setActivityData] = useState(null);

  const { data: statsData, isLoading: statsLoading, isError: statsError, error: statsErr, refetch: refetchStats } = useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: dashboardService.getStats,
  });

  const { data: heatmapData } = useQuery({
    queryKey: ["dashboardHeatmap"],
    queryFn: dashboardService.getHeatmap,
  });

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await activityLogService.getRecentActivities();
        setActivityData(res.data?.data);
      } catch {
        setActivityData([]);
      }
    };
    fetchActivity();
  }, []);

  const stats = statsData?.data?.data;
  const isEmpty = stats && Object.values(stats).every((v) => v === 0);
  const heatmap = heatmapData?.data?.data;

  const xp = stats?.total_xp ?? 0;
  const level = stats ? Math.floor(Math.max(0, xp - 1) / 100) + 1 : 1;
  const todaySolved = stats?.today_solved ?? 0;
  const claimed = stats?.claimed ?? false;

  const handleClaimXp = async () => {
    if (claiming || claimed) return;
    setClaiming(true);
    try {
      const res = await dailyStatsService.populate();
      const solved = res?.data?.data?.problems_solved ?? 0;
      const xpEarned = solved * 5;
      toast.success(`+${xpEarned} XP claimed! (${solved} problem${solved !== 1 ? "s" : ""})`);
      refetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to claim XP. Try again.");
    } finally {
      setClaiming(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await platformService.syncAll();
      const errors = res.data?.data?.errors;
      if (errors && errors.length > 0) {
        toast.error(`Sync failed for: ${errors.join(", ")}. Other platforms synced successfully.`);
      } else {
        toast.success("Sync completed!");
      }
      refetchStats();
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    } catch {
      toast.error("Sync failed. Try again.");
    } finally {
      setSyncing(false);
    }
  };

  if (statsLoading) {
    return (
      <div style={{ paddingBottom: "32px" }}>
        <div style={{ marginBottom: "24px" }}>
          <Skeleton variant="text" width="280px" height={32} />
        </div>
        <Skeleton variant="card" height={80} />
        <div style={{
          display: "grid", gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`,
          gap: "16px", marginTop: "24px",
        }}>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} variant="card" height={130} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "24px" }}>
          <Skeleton variant="card" height={120} />
          <Skeleton variant="card" height={200} />
          <Skeleton variant="card" height={120} />
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div style={{ paddingBottom: "32px" }}>
        <Card padding="md" style={{ textAlign: "center", marginTop: "24px" }}>
          <div style={{ border: "3px solid #FF4757", borderRadius: "16px", padding: "24px" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#FF4757", margin: "0 0 12px" }}>
              {statsErr?.response?.data?.message || statsErr?.message || "Failed to load dashboard"}
            </p>
            <button onClick={refetchStats} style={{
              padding: "8px 24px", borderRadius: "12px",
              border: "3px solid #000", background: "#FFD93D",
              fontFamily: "var(--font-heading)", fontWeight: 700,
              fontSize: "14px", cursor: "pointer", boxShadow: "4px 4px 0 #000",
            }}>Retry</button>
          </div>
        </Card>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div style={{ paddingBottom: "32px" }}>
        <GreetingBanner name={user?.name || "Coder"} onSync={handleSync} syncing={syncing} />
        <EmptyState onConnect={() => navigate(ROUTES.profile)} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ paddingBottom: "32px" }}
    >
      <GreetingBanner name={user?.name || "Coder"} onSync={handleSync} syncing={syncing} />
      <AIMiniWidget onClaimXp={handleClaimXp} claiming={claiming} claimed={claimed} todaySolved={todaySolved} />

      <motion.div
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } },
        }}
        initial="hidden"
        animate="show"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`,
          gap: "16px", marginBottom: "24px",
        }}
      >
        {STAT_CARDS.map((card) => (
          <motion.div
            key={card.key}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 180, damping: 18 } },
            }}
          >
            {card.key === "level" ? (
              <Card padding="md">
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: "8px", textAlign: "center",
                }}>
                  <LevelIcon />
                  <LevelBadge level={level} />
                  <span style={{
                    fontFamily: "var(--font-body)", fontSize: "13px",
                    color: "#888", lineHeight: 1.2, marginTop: "4px",
                  }}>
                    Level
                  </span>
                </div>
              </Card>
            ) : card.key === "xp" ? (
              <StatCard icon={<XPIcon />} value={xp} label="XP" color="#FFD93D" />
            ) : (
              <StatCard
                icon={card.icon}
                value={stats?.[card.key] ?? 0}
                label={card.label}
                color={card.color}
                suffix={card.key === "streak" ? "🔥" : ""}
              />
            )}
          </motion.div>
        ))}
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <Card padding="md">
          <h3 style={sectionTitleStyle}>Recent Activity</h3>
          <ActivityFeed activities={activityData} />
        </Card>
      </div>
    </motion.div>
  );
}

const sectionTitleStyle = {
  fontFamily: "var(--font-heading)",
  fontWeight: 700,
  fontSize: "16px",
  margin: "0 0 12px",
  color: "var(--color-dark)",
};

export default Dashboard;
