import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import { PLATFORMS } from "../../services/platformService";
import { leaderboardService } from "../../services/leaderboardService";
import usePageTitle from "../../hooks/usePageTitle";

const TABS = [
  { id: "global", label: "Global" },
  { id: "friends", label: "Friends" },
  { id: "streaks", label: "Streaks" },
  { id: "contributors", label: "Contributors" },
];

function LeaderboardRow({ rank, name, avatar, solved, streak, contributions, isUser }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      padding: "12px 16px",
      background: isUser ? "#FFF3CD" : "#fff",
      border: isUser ? "2px solid #000" : "2px solid #E8E8E8",
      borderRadius: "12px",
    }}>
      <span style={{
        fontFamily: "var(--font-heading)", fontWeight: 700,
        fontSize: "16px", color: rank <= 3 ? "#FFD93D" : "#888",
        minWidth: 28, textAlign: "center",
      }}>
        {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
      </span>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: "#E8E8E8", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "14px",
        fontFamily: "var(--font-heading)", fontWeight: 600,
        overflow: "hidden", flexShrink: 0,
      }}>
        {avatar ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : name?.[0]?.toUpperCase()}
      </div>
      <span style={{
        flex: 1, fontFamily: "var(--font-heading)", fontWeight: 600,
        fontSize: "14px", color: "var(--color-dark)",
      }}>
        {name}
      </span>
      {solved !== undefined && (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "13px", color: "#4D96FF" }}>
          {solved} solved
        </span>
      )}
      {streak !== undefined && (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "13px", color: "#FF6B35" }}>
          🔥 {streak}
        </span>
      )}
      {contributions !== undefined && (
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "13px", color: "#14B8A6" }}>
          {contributions} contrib
        </span>
      )}
    </div>
  );
}

function Leaderboard() {
  usePageTitle("Leaderboard");
  const [tab, setTab] = useState("global");
  const [platform, setPlatform] = useState("");
  const [page, setPage] = useState(1);

  const { data: globalData, isLoading: globalLoading } = useQuery({
    queryKey: ["leaderboard", "global", page],
    queryFn: () => leaderboardService.getGlobal(page),
    enabled: tab === "global",
  });

  const { data: friendsData, isLoading: friendsLoading } = useQuery({
    queryKey: ["leaderboard", "friends"],
    queryFn: leaderboardService.getFriends,
    enabled: tab === "friends",
  });

  const { data: streaksData, isLoading: streaksLoading } = useQuery({
    queryKey: ["leaderboard", "streaks"],
    queryFn: leaderboardService.getStreaks,
    enabled: tab === "streaks",
  });

  const { data: contributorsData, isLoading: contributorsLoading } = useQuery({
    queryKey: ["leaderboard", "contributors"],
    queryFn: leaderboardService.getContributors,
    enabled: tab === "contributors",
  });

  const isLoading = globalLoading || friendsLoading || streaksLoading || contributorsLoading;

  const getData = () => {
    switch (tab) {
      case "global":
        return { items: globalData?.data?.data?.data || [], totalPages: globalData?.data?.data?.totalPages || 1 };
      case "friends":
        return { items: friendsData?.data?.data || [], totalPages: 1 };
      case "streaks":
        return { items: streaksData?.data?.data || [], totalPages: 1 };
      case "contributors":
        return { items: contributorsData?.data?.data || [], totalPages: 1 };
      default:
        return { items: [], totalPages: 1 };
    }
  };

  const { items, totalPages } = getData();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ paddingBottom: "32px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "26px", margin: "0 0 24px", color: "var(--color-dark)" }}>
        🏆 Leaderboard
      </h1>

      <Card padding="md" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setPage(1); }}
              style={{
                padding: "6px 16px", borderRadius: "8px", border: "2px solid #000",
                background: tab === t.id ? "#FFD93D" : "#fff",
                fontFamily: "var(--font-heading)", fontWeight: 600,
                fontSize: "12px", cursor: "pointer",
                boxShadow: tab === t.id ? "3px 3px 0 #000" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}
            style={{
              marginLeft: "auto", padding: "6px 12px", borderRadius: "8px",
              border: "2px solid #000", fontFamily: "var(--font-heading)",
              fontWeight: 600, fontSize: "12px", background: "#fff",
            }}
          >
            <option value="">All Platforms</option>
            {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} variant="card" height={52} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#aaa", fontFamily: "var(--font-body)", fontSize: "13px" }}>
            {tab === "friends" ? "Add friends to see their rankings" : "No data yet"}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {items.map((item, i) => (
              <LeaderboardRow key={item.id} rank={tab === "global" ? (page - 1) * 50 + i + 1 : i + 1}
                name={item.name} solved={item.total_solved} streak={item.streak} contributions={item.contributions} />
            ))}
          </div>
        )}

        {tab === "global" && totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "2px solid #000",
                background: "#fff", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "12px", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}>
              ← Prev
            </button>
            <span style={{ padding: "8px 16px", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "13px" }}>
              Page {page} of {totalPages}
            </span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "2px solid #000",
                background: "#fff", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "12px", cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.5 : 1 }}>
              Next →
            </button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default Leaderboard;
