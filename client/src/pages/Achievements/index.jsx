import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";
import { achievementService } from "../../services/achievementService";
import usePageTitle from "../../hooks/usePageTitle";

const ACHIEVEMENT_BG = {
  problem: "linear-gradient(135deg, #FFF3CD, #FFE5A0)",
  streak: "linear-gradient(135deg, #FFE0E0, #FFB3B3)",
  contest: "linear-gradient(135deg, #D4F1FF, #A8E0FF)",
  contribution: "linear-gradient(135deg, #D4FFE0, #A8FFC0)",
};

function Achievements() {
  usePageTitle("Achievements");
  const [checking, setChecking] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: achievementService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const achievements = data?.data?.data || [];

  const handleCheck = async () => {
    setChecking(true);
    try {
      const res = await achievementService.check();
      const unlocked = res.data?.data || [];
      if (unlocked.length > 0) {
        unlocked.forEach((a) => toast.success(`🏆 Unlocked: ${a.title}`));
      } else {
        toast("No new achievements yet. Keep coding!");
      }
    } catch {
      toast.error("Failed to check achievements");
    } finally {
      setChecking(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ paddingBottom: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "26px", margin: 0, color: "var(--color-dark)" }}>
          ⭐ Achievements
        </h1>
        <Button size="sm" loading={checking} onClick={handleCheck}>Check for new</Button>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} variant="card" height={100} />)}
        </div>
      ) : achievements.length === 0 ? (
        <Card padding="md" style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#888", margin: 0 }}>
            No achievements yet. Sync your platforms and check for new achievements!
          </p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
          {achievements.map((a) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: ACHIEVEMENT_BG[a.type] || "#fff",
                border: "3px solid #000",
                borderRadius: "16px",
                boxShadow: "6px 6px 0 #000",
                padding: "16px",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>{a.icon || "🏆"}</div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "14px", margin: "0 0 4px", color: "var(--color-dark)" }}>
                {a.title}
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#666", margin: 0 }}>
                {a.description}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default Achievements;
