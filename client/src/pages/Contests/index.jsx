import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";
import { contestService } from "../../services/contestService";
import usePageTitle from "../../hooks/usePageTitle";

function RatingGraph({ data, height = 200 }) {
  const containerRef = useRef(null);
  const [chartW, setChartW] = useState(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setChartW(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) return <div style={{ textAlign: "center", padding: "32px 0", color: "#aaa", fontFamily: "var(--font-body)", fontSize: "13px" }}>No contest history yet</div>;

  const ratings = data.map((d) => d.rating);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);
  const range = Math.max(maxRating - minRating, 1);
  const padX = 30;
  const padY = 20;
  const drawW = Math.max(chartW - padX * 2, 100);
  const drawH = height - padY * 2;
  const stepX = drawW / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: padX + i * stepX,
    y: padY + drawH - ((d.rating - minRating) / range) * drawH,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <svg viewBox={`0 0 ${chartW} ${height}`} style={{ width: chartW, height, display: "block" }}>
        <path d={pathD} fill="none" stroke="#4D96FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#fff" stroke="#4D96FF" strokeWidth="2" />
        ))}
        <text x={10} y={padY + 4} fill="#888" fontSize="9" fontFamily="var(--font-mono)">{maxRating}</text>
        <text x={10} y={height - padY + 4} fill="#888" fontSize="9" fontFamily="var(--font-mono)">{minRating}</text>
      </svg>
    </div>
  );
}

function Countdown({ startTime }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(startTime).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Started"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`);
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [startTime]);

  return <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "13px", color: "#FF6B35" }}>{remaining}</span>;
}

function Contests() {
  usePageTitle("Contests");
  const [page, setPage] = useState(1);
  const [syncing, setSyncing] = useState(false);

  const { data: upcomingData, isLoading: upcomingLoading } = useQuery({
    queryKey: ["upcomingContests"],
    queryFn: contestService.getUpcomingContests,
    staleTime: 300000,
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["contestHistory", page],
    queryFn: () => contestService.getHistory(page),
  });

  const { data: ratingData, isLoading: ratingLoading } = useQuery({
    queryKey: ["contestRating"],
    queryFn: contestService.getRatingGraph,
  });

  const upcoming = upcomingData?.data?.data || [];
  const history = historyData?.data?.data?.data || [];
  const totalPages = historyData?.data?.data?.totalPages || 1;
  const ratingGraph = ratingData?.data?.data || [];

  const handleSync = async () => {
    setSyncing(true);
    try {
      await contestService.syncHistory();
      toast.success("Contest history synced!");
    } catch {
      toast.error("Failed to sync contest history. Connect Codeforces first.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ paddingBottom: "32px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "26px", margin: "0 0 24px", color: "var(--color-dark)" }}>
        📅 Contests
      </h1>

      <Card padding="md" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "16px", margin: 0, color: "var(--color-dark)" }}>
            Rating Graph
          </h3>
          <Button size="sm" loading={syncing} onClick={handleSync}>⟳ Sync</Button>
        </div>
        {ratingLoading ? <Skeleton variant="card" height={200} /> : <RatingGraph data={ratingGraph} height={200} />}
      </Card>

      <Card padding="md" style={{ marginBottom: "20px" }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "16px", margin: "0 0 16px", color: "var(--color-dark)" }}>
          Upcoming Contests
        </h3>
        {upcomingLoading ? (
          <Skeleton variant="card" height={120} />
        ) : upcoming.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#aaa", fontFamily: "var(--font-body)", fontSize: "13px" }}>No upcoming contests</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {upcoming.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "#F8F8F8", borderRadius: "12px", border: "2px solid #E8E8E8" }}>
                <span style={{ fontSize: "20px" }}>📊</span>
                <span style={{ flex: 1, fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "13px", color: "var(--color-dark)" }}>
                  {c.contestName}
                </span>
                <Countdown startTime={c.startTime} />
                <a href={c.url} target="_blank" rel="noreferrer" style={{
                  padding: "6px 12px", borderRadius: "8px", border: "2px solid #000",
                  background: "#FFD93D", fontFamily: "var(--font-heading)", fontWeight: 700,
                  fontSize: "11px", textDecoration: "none", color: "var(--color-dark)",
                }}>View</a>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card padding="md">
        <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "16px", margin: "0 0 16px", color: "var(--color-dark)" }}>
          Contest History
        </h3>
        {historyLoading ? (
          <Skeleton variant="card" height={200} />
        ) : history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#aaa", fontFamily: "var(--font-body)", fontSize: "13px" }}>
            No contest history. Connect Codeforces and click Sync.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-body)", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #000" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600, color: "#888" }}>Contest</th>
                  <th style={{ textAlign: "center", padding: "8px 12px", fontWeight: 600, color: "#888" }}>Rank</th>
                  <th style={{ textAlign: "center", padding: "8px 12px", fontWeight: 600, color: "#888" }}>Rating</th>
                  <th style={{ textAlign: "center", padding: "8px 12px", fontWeight: 600, color: "#888" }}>Change</th>
                </tr>
              </thead>
              <tbody>
                {history.map((c, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #E8E8E8" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 500 }}>{c.contest_name}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center", fontFamily: "var(--font-mono)" }}>{c.rank}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 600, color: "#4D96FF" }}>{c.new_rating}</td>
                    <td style={{
                      padding: "10px 12px", textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 600,
                      color: c.rating_change >= 0 ? "#6BCB77" : "#FF4757",
                    }}>
                      {c.rating_change >= 0 ? "+" : ""}{c.rating_change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "2px solid #000", background: "#fff", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "12px", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}>
              ← Prev
            </button>
            <span style={{ padding: "8px 16px", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "13px" }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "2px solid #000", background: "#fff", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "12px", cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.5 : 1 }}>
              Next →
            </button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default Contests;
