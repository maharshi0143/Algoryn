import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";
import { notificationService } from "../../services/notificationService";
import { useSocketNotification } from "../../hooks/useSocketNotification";

const TYPE_COLORS = {
  achievement: "#FFD93D",
  contest: "#6BCB77",
  weekly_report: "#4D96FF",
  streak: "#FF6B6B",
  sync: "#A66CFF",
  friend: "#FF8A5C",
};

function Notifications() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => notificationService.list(page),
  });

  const result = data?.data;
  const items = result?.data || [];
  const totalPages = result?.totalPages || 1;

  const markReadMut = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteMut = useMutation({
    mutationFn: notificationService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const handleNewNotification = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [queryClient]);

  useSocketNotification(handleNewNotification);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ paddingBottom: "32px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "26px", margin: "0 0 24px", color: "var(--color-dark)" }}>
        🔔 Notifications
      </h1>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} variant="card" height={60} />)}
        </div>
      ) : items.length === 0 ? (
        <Card padding="md" style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#888", margin: 0 }}>
            No notifications yet. They'll appear here in real-time!
          </p>
        </Card>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {items.map((n) => (
              <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", borderRadius: "12px",
                  border: "2px solid #000", background: n.is_read ? "#f9f9f9" : "#fff",
                  opacity: n.is_read ? 0.6 : 1,
                }}
              >
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: TYPE_COLORS[n.type] || "#999", flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", margin: 0, color: "var(--color-dark)", wordBreak: "break-word" }}>
                    {n.message}
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", margin: "4px 0 0", color: "#aaa" }}>
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                  {!n.is_read && (
                    <Button size="xs" onClick={() => markReadMut.mutate(n.id)}>
                      Mark read
                    </Button>
                  )}
                  <Button size="xs" variant="ghost" onClick={() => deleteMut.mutate(n.id)}>
                    ✕
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
              <Button size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#888", alignSelf: "center" }}>
                Page {page} of {totalPages}
              </span>
              <Button size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default Notifications;
