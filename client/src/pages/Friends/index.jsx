import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";
import { friendService } from "../../services/friendService";

function Friends() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState("friends");

  const { data: friendsData, isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: friendService.list,
  });

  const { data: pendingData, isLoading: loadingPending } = useQuery({
    queryKey: ["friend-requests"],
    queryFn: friendService.pending,
  });

  const friends = friendsData?.data?.data || [];
  const pending = pendingData?.data?.data || [];

  const sendMut = useMutation({
    mutationFn: friendService.sendRequest,
    onSuccess: () => {
      toast.success("Friend request sent!");
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to send request"),
  });

  const acceptMut = useMutation({
    mutationFn: friendService.accept,
    onSuccess: () => {
      toast.success("Friend request accepted!");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });

  const rejectMut = useMutation({
    mutationFn: friendService.reject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });

  const removeMut = useMutation({
    mutationFn: friendService.remove,
    onSuccess: () => {
      toast.success("Friend removed");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ paddingBottom: "32px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "26px", margin: "0 0 24px", color: "var(--color-dark)" }}>
        👥 Friends
      </h1>

      <Card padding="md" style={{ marginBottom: "20px" }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "14px", margin: "0 0 12px", color: "var(--color-dark)" }}>
          Add a Friend
        </h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <input type="email" placeholder="Enter friend's email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              flex: 1, padding: "10px 12px", borderRadius: "10px", border: "2px solid #000",
              fontFamily: "var(--font-body)", fontSize: "13px", outline: "none",
            }}
          />
          <Button size="sm" loading={sendMut.isPending} disabled={!email.trim()} onClick={() => sendMut.mutate(email.trim())}>
            Send Request
          </Button>
        </div>
      </Card>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <Button size="sm" variant={tab === "friends" ? "primary" : "ghost"} onClick={() => setTab("friends")}>
          My Friends ({friends.length})
        </Button>
        <Button size="sm" variant={tab === "pending" ? "primary" : "ghost"} onClick={() => setTab("pending")}>
          Pending Requests ({pending.length})
        </Button>
      </div>

      {tab === "friends" && (
        loadingFriends ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} variant="card" height={60} />)}
          </div>
        ) : friends.length === 0 ? (
          <Card padding="md" style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#888", margin: 0 }}>
              No friends yet. Send a friend request!
            </p>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {friends.map((f) => (
              <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", borderRadius: "12px",
                  border: "2px solid #000", background: "#fff",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "#eee", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "16px",
                  color: "#999", border: "2px solid #000",
                }}>
                  {f.avatar ? (
                    <img src={f.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    (f.name || f.email)[0].toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "14px", margin: 0, color: "var(--color-dark)" }}>
                    {f.name || "Unknown"}
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", margin: "2px 0 0", color: "#999" }}>
                    {f.email}
                  </p>
                </div>
                <Button size="sm" variant="danger" onClick={() => removeMut.mutate(f.id)}>
                  Remove
                </Button>
              </motion.div>
            ))}
          </div>
        )
      )}

      {tab === "pending" && (
        loadingPending ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {Array.from({ length: 2 }, (_, i) => <Skeleton key={i} variant="card" height={60} />)}
          </div>
        ) : pending.length === 0 ? (
          <Card padding="md" style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#888", margin: 0 }}>
              No pending requests.
            </p>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {pending.map((p) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", borderRadius: "12px",
                  border: "2px solid #000", background: "#fff",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "#eee", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "16px",
                  color: "#999", border: "2px solid #000",
                }}>
                  {p.avatar ? (
                    <img src={p.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    (p.name || p.email)[0].toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "14px", margin: 0, color: "var(--color-dark)" }}>
                    {p.name || "Unknown"}
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", margin: "2px 0 0", color: "#999" }}>
                    {p.email}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <Button size="sm" onClick={() => acceptMut.mutate(p.id)}>Accept</Button>
                  <Button size="sm" variant="ghost" onClick={() => rejectMut.mutate(p.id)}>Reject</Button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </motion.div>
  );
}

export default Friends;
