import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import { aiService } from "../../services/aiService";
import usePageTitle from "../../hooks/usePageTitle";

const TABS = [
  { key: "insights", label: "Insights" },
  { key: "recommendations", label: "Recommendations" },
  { key: "weakness", label: "Weakness Analysis" },
];

function TabButton({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 18px", borderRadius: "10px", border: "2px solid #000", cursor: "pointer",
      background: active ? "#6BCB77" : "#fff", color: active ? "#fff" : "var(--color-dark)",
      boxShadow: active ? "3px 3px 0 #000" : "none", transform: active ? "translate(-1px,-1px)" : "none",
      fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "13px", transition: "all 0.15s",
    }}>
      {children}
    </button>
  );
}

function AICoach() {
  usePageTitle("AI Coach");
  const [tab, setTab] = useState("insights");

  const { data, isLoading } = useQuery({
    queryKey: ["ai", tab],
    queryFn: () => {
      if (tab === "insights") return aiService.getInsights();
      if (tab === "recommendations") return aiService.getRecommendations();
      return aiService.getWeakness();
    },
  });

  const result = data?.data?.data;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ paddingBottom: "32px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "26px", margin: "0 0 8px", color: "var(--color-dark)" }}>
          🤖 AI Coach
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#999", margin: 0 }}>
          AI-powered insights to level up your coding
        </p>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <TabButton key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>{t.label}</TabButton>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} variant="card" height={80} />)}
        </div>
      ) : !result ? (
        <Card padding="md" style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#888", margin: 0 }}>
            No data available. Sync your platforms first.
          </p>
        </Card>
      ) : (
        <div>
          {Array.isArray(result) ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {result.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card padding="md" style={{ border: "2px solid #000" }}>
                    {typeof item === "string" ? (
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", margin: 0, color: "var(--color-dark)" }}>{item}</p>
                    ) : (
                      <>
                        {item.title && <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "14px", margin: "0 0 4px", color: "var(--color-dark)" }}>{item.title}</h4>}
                        {item.description && <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", margin: 0, color: "#666" }}>{item.description}</p>}
                        {item.platform && <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", margin: "4px 0 0", color: "#999" }}>Platform: {item.platform}</p>}
                        {item.difficulty && <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", margin: "4px 0 0", color: "#999" }}>Difficulty: {item.difficulty}</p>}
                      </>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : typeof result === "object" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Object.entries(result).map(([key, value], i) => (
                <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card padding="md" style={{ border: "2px solid #000" }}>
                    <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "13px", margin: "0 0 4px", textTransform: "capitalize", color: "var(--color-dark)" }}>
                      {key.replace(/_/g, " ")}
                    </h4>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", margin: 0, color: "#666" }}>
                      {typeof value === "string" ? value : JSON.stringify(value)}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card padding="md">
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", margin: 0, color: "var(--color-dark)" }}>{String(result)}</p>
            </Card>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default AICoach;
