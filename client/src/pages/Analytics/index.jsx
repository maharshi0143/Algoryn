import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import Tabs from "../../components/ui/Tabs";
import { analyticsService, ANALYTICS_QUERY_KEY } from "../../services/analyticsService";
import { PLATFORMS } from "../../services/platformService";
import usePageTitle from "../../hooks/usePageTitle";

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

function SvgLineChart({ data, height = 200 }) {
  const containerRef = useRef(null);
  const [chartW, setChartW] = useState(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setChartW(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) return null;

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 1);
  const padX = 30;
  const padY = 20;
  const drawW = Math.max(chartW - padX * 2, 100);
  const drawH = height - padY * 2;
  const stepX = drawW / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: padX + i * stepX,
    y: padY + drawH - (d.value / maxVal) * drawH,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPathD = `${pathD} L ${points[points.length - 1].x} ${padY + drawH} L ${points[0].x} ${padY + drawH} Z`;

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <svg viewBox={`0 0 ${chartW} ${height}`} style={{ width: chartW, height, display: "block" }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD93D" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFD93D" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = padY + drawH - frac * drawH;
          return (
            <line key={frac} x1={padX} y1={y} x2={chartW - padX} y2={y}
              stroke="#E8E8E8" strokeWidth="1" />
          );
        })}

        <path d={areaPathD} fill="url(#areaGrad)" />
        <path d={pathD} fill="none" stroke="#FFD93D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#FFD93D" strokeWidth="2.5" />
        ))}

        {data.map((d, i) => (
          <text key={i} x={points[i].x} y={height - 4} textAnchor="middle"
            fill="#888" fontSize="9" fontFamily="var(--font-mono)">
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
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

const sectionTitleStyle = {
  fontFamily: "var(--font-heading)",
  fontWeight: 700,
  fontSize: "16px",
  margin: "0 0 12px",
  color: "var(--color-dark)",
};

function Analytics() {
  usePageTitle("Analytics");
  const isMobile = useMediaQuery("(max-width: 1024px)");

  const { data: platformsData, isLoading: platformsLoading } = useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, "platforms"],
    queryFn: analyticsService.getPlatforms,
  });

  const { data: yearlyData, isLoading: yearlyLoading } = useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, "yearly"],
    queryFn: analyticsService.getYearly,
  });

  const { data: languagesData, isLoading: languagesLoading } = useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, "languages"],
    queryFn: analyticsService.getLanguages,
  });

  const isLoading = platformsLoading || yearlyLoading || languagesLoading;

  const platforms = platformsData?.data?.data || [];
  const yearly = yearlyData?.data?.data || [];
  const languages = languagesData?.data?.data || [];

  const monthlyProgress = yearly.map((m) => ({
    label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][(m.month || 1) - 1],
    value: Number(m.problems_solved || 0),
  }));

  const platformTabs = platforms.length > 0
    ? platforms.map((p) => {
        const meta = PLATFORMS.find((pf) => pf.id === p.platform);
        return {
          label: meta?.name || p.platform,
          content: (
            <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "16px", background: "#F8F8F8",
                borderRadius: "12px", border: "2px solid #E8E8E8",
              }}>
                <span style={{ fontSize: "32px" }}>{meta?.icon ? <meta.icon /> : "📊"}</span>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: "var(--font-heading)", fontWeight: 700,
                    fontSize: "18px", margin: "0 0 4px", color: "var(--color-dark)",
                  }}>
                    {meta?.name || p.platform}
                  </p>
                  {Array.isArray(p.skills) && p.skills.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
                      {p.skills.map((skill, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{
                            fontFamily: "var(--font-mono)", fontSize: "12px",
                            color: "#555", minWidth: "120px",
                          }}>
                            {skill.name}
                          </span>
                          <span style={{ fontSize: "12px", color: "#FFB800", letterSpacing: "2px" }}>
                            {"⭐".repeat(skill.stars)}
                          </span>
                          <span style={{
                            fontFamily: "var(--font-mono)", fontSize: "11px",
                            color: "#aaa", marginLeft: "4px",
                          }}>
                            {skill.stars}/5
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{
                      fontFamily: "var(--font-mono)", fontSize: "13px",
                      margin: 0, color: "#888",
                    }}>
                      {p.total_solved || 0} problems solved
                    </p>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  {p.rating ? (
                    <>
                      <p style={{
                        fontFamily: "var(--font-heading)", fontWeight: 700,
                        fontSize: "22px", margin: 0, color: meta?.color || "#888",
                      }}>
                        {p.rating}
                      </p>
                      <p style={{
                        fontFamily: "var(--font-mono)", fontSize: "11px",
                        margin: 0, color: "#aaa",
                      }}>
                        rating
                      </p>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ),
        };
      })
    : [{ label: "No platforms", content: <div style={{ padding: "24px 0", textAlign: "center", color: "#aaa", fontSize: "13px", fontFamily: "var(--font-body)" }}>Connect a platform to see breakdown</div> }];

  if (isLoading) {
    return (
      <div style={{ paddingBottom: "32px" }}>
        <Skeleton variant="text" width="200px" height={32} />
        <div style={{
          display: "grid", gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`,
          gap: "16px", marginTop: "24px",
        }}>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} variant="card" height={130} />
          ))}
        </div>
        <div style={{ marginTop: "24px" }}>
          <Skeleton variant="card" height={200} />
        </div>
        <div style={{ marginTop: "24px" }}>
          <Skeleton variant="card" height={200} />
        </div>
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
      <h1 style={{
        fontFamily: "var(--font-heading)", fontWeight: 700,
        fontSize: "26px", margin: "0 0 24px", color: "var(--color-dark)",
      }}>
        📊 Analytics
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`,
        gap: "16px", marginBottom: "24px",
      }}>
        {PLATFORMS.map((p) => {
          const match = platforms.find((pf) => pf.platform === p.id);
          return (
            <StatCard
              key={p.id}
              icon={<p.icon />}
              value={p.id === "hackerrank" ? (match?.skills?.length || 0) : (match?.total_solved || 0)}
              label={p.name}
              color={p.color}
              suffix={p.id === "hackerrank" ? " skills" : ""}
            />
          );
        })}
      </div>

      <Card padding="md" style={{ marginBottom: "20px" }}>
        <h3 style={sectionTitleStyle}>Platform Breakdown</h3>
        <Tabs tabs={platformTabs} />
      </Card>

      <Card padding="md" style={{ marginBottom: "20px" }}>
        <h3 style={sectionTitleStyle}>Progress Chart</h3>
        {monthlyProgress.length > 0 ? (
          <SvgLineChart data={monthlyProgress} height={200} />
        ) : (
          <div style={{
            textAlign: "center", padding: "40px 0",
            fontFamily: "var(--font-body)", fontSize: "13px", color: "#aaa",
          }}>
            No progress data yet
          </div>
        )}
      </Card>

      <Card padding="md">
        <h3 style={sectionTitleStyle}>Language Distribution</h3>
        {languages.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {languages.map((lang) => (
              <div key={lang.language} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontWeight: 600,
                  fontSize: "13px", color: "#444", minWidth: 100,
                }}>
                  {lang.language}
                </span>
                <div style={{
                  flex: 1, height: 20, borderRadius: "10px",
                  background: "#E8E8E8", overflow: "hidden",
                  border: "2px solid #000",
                }}>
                  <div style={{
                    width: `${lang.percentage}%`, height: "100%",
                    borderRadius: "8px",
                    background: "linear-gradient(90deg, #FFD93D, #FF9F43)",
                    transition: "width 0.6s ease",
                  }} />
                </div>
                <span style={{
                  fontFamily: "var(--font-mono)", fontWeight: 600,
                  fontSize: "12px", color: "#888", minWidth: 36, textAlign: "right",
                }}>
                  {lang.percentage}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: "center", padding: "32px 0",
            fontFamily: "var(--font-body)", fontSize: "13px", color: "#aaa",
          }}>
            Connect your GitHub profile to see language distribution.
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default Analytics;
