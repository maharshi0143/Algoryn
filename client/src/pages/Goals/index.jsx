import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";
import { goalService } from "../../services/goalService";

function Goals() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [target, setTarget] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: goalService.list,
  });

  const goals = data?.data?.data || [];

  const createMut = useMutation({
    mutationFn: (body) => goalService.create(body),
    onSuccess: () => {
      toast.success("Goal created!");
      setShowCreate(false);
      setTarget("");
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create goal"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, current_progress }) => goalService.updateProgress(id, current_progress),
    onSuccess: () => {
      toast.success("Progress updated!");
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update goal"),
  });

  const deleteMut = useMutation({
    mutationFn: goalService.delete,
    onSuccess: () => {
      toast.success("Goal deleted");
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const handleCreate = () => {
    const t = parseInt(target, 10);
    if (!t || t < 1) {
      toast.error("Enter a valid target (>= 1)");
      return;
    }
    createMut.mutate({ target: t, month, year });
  };

  const handleUpdate = (goal) => {
    const v = parseInt(editValue, 10);
    if (v < 0 || v > goal.target) {
      toast.error(`Progress must be between 0 and ${goal.target}`);
      return;
    }
    updateMut.mutate({ id: goal.id, current_progress: v });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ paddingBottom: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "26px", margin: 0, color: "var(--color-dark)" }}>
          🎯 Goals
        </h1>
        <Button size="sm" onClick={() => setShowCreate((p) => !p)}>
          {showCreate ? "Cancel" : "New Goal"}
        </Button>
      </div>

      {showCreate && (
        <Card padding="md" style={{ marginBottom: "20px" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "14px", margin: "0 0 12px", color: "var(--color-dark)" }}>
            Create Monthly Goal
          </h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>Target problems</label>
              <input type="number" min="1" placeholder="e.g. 30" value={target}
                onChange={(e) => setTarget(e.target.value)}
                style={{ padding: "10px 12px", borderRadius: "10px", border: "2px solid #000", fontFamily: "var(--font-body)", fontSize: "13px", outline: "none", width: 100 }}
              />
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>Month</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
                style={{ padding: "10px 12px", borderRadius: "10px", border: "2px solid #000", fontFamily: "var(--font-body)", fontSize: "13px", outline: "none" }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString("default", { month: "long" })}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#888", display: "block", marginBottom: "4px" }}>Year</label>
              <input type="number" min="2025" value={year} onChange={(e) => setYear(Number(e.target.value))}
                style={{ padding: "10px 12px", borderRadius: "10px", border: "2px solid #000", fontFamily: "var(--font-body)", fontSize: "13px", outline: "none", width: 80 }}
              />
            </div>
            <Button size="sm" loading={createMut.isPending} onClick={handleCreate} style={{ marginTop: "18px" }}>
              Create
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} variant="card" height={100} />)}
        </div>
      ) : goals.length === 0 ? (
        <Card padding="md" style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#888", margin: 0 }}>
            No goals yet. Create your first monthly goal!
          </p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {goals.map((g, i) => {
            const pct = g.target > 0 ? Math.min(100, Math.round((g.current_progress / g.target) * 100)) : 0;
            return (
              <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card padding="md">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "14px", margin: 0, color: "var(--color-dark)" }}>
                        {g.month ? new Date(g.year || 2025, g.month - 1).toLocaleString("default", { month: "long" }) : "Custom"} {g.year || ""}
                      </h4>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#999", margin: "2px 0 0" }}>
                        {g.current_progress} / {g.target} problems solved
                      </p>
                    </div>
                    <Button size="xs" variant="danger" onClick={() => deleteMut.mutate(g.id)}>
                      Delete
                    </Button>
                  </div>

                  <div style={{
                    height: 8, borderRadius: 4, background: "#eee", overflow: "hidden",
                    border: "2px solid #000",
                  }}>
                    <div style={{
                      width: `${pct}%`, height: "100%",
                      background: pct >= 100 ? "#6BCB77" : "#FFD93D",
                      borderRadius: 3, transition: "width 0.3s",
                    }} />
                  </div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#888", margin: "4px 0 0", textAlign: "right" }}>
                    {pct}% complete
                  </p>

                  {editingId === g.id ? (
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      <input type="number" min="0" max={g.target} value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "2px solid #000", fontFamily: "var(--font-body)", fontSize: "12px", outline: "none", maxWidth: 120 }}
                      />
                      <Button size="xs" loading={updateMut.isPending} onClick={() => handleUpdate(g)}>Save</Button>
                      <Button size="xs" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="xs" onClick={() => { setEditingId(g.id); setEditValue(String(g.current_progress)); }} style={{ marginTop: "8px" }}>
                      Update Progress
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export default Goals;
