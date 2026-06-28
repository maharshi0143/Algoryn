import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { emailPreferenceService } from "../../services/emailPreferenceService";
import useAuthStore from "../../store/authStore";
import { ROUTES } from "../../constants/routes";
import api from "../../api/axios";
import usePageTitle from "../../hooks/usePageTitle";

function Toggle({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "8px 0" }}>
      <div style={{
        width: 44, height: 24, borderRadius: 12, background: checked ? "#6BCB77" : "#ccc",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
        onClick={(e) => { e.preventDefault(); onChange(!checked); }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: "50%", background: "#fff",
          position: "absolute", top: 2, left: checked ? 22 : 2,
          transition: "left 0.2s", border: "2px solid #000",
        }} />
      </div>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--color-dark)" }}>{label}</span>
    </label>
  );
}

function Settings() {
  usePageTitle("Settings");
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const [prefs, setPrefs] = useState(null);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleExport = async (format) => {
    try {
      const res = await api.get(`/export/${format}`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Algoryn_Report.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to export ${format.toUpperCase()}`);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await emailPreferenceService.get();
        setPrefs(res.data?.data || {});
      } catch {
        setPrefs({ weekly_report: true, contest_reminder: true, streak_alert: true, achievement_alert: true });
      } finally {
        setLoadingPrefs(false);
      }
    };
    load();
  }, []);

  const handleToggle = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    try {
      await emailPreferenceService.update(prefs);
      toast.success("Preferences saved!");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Fill in both password fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setChangingPassword(true);
    try {
      const { default: authService } = await import("../../services/authService");
      await authService.changePassword(currentPassword, newPassword);
      toast.success("Password changed!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete !== "DELETE") {
      toast.error('Type "DELETE" to confirm');
      return;
    }
    setDeleting(true);
    try {
      const { default: authService } = await import("../../services/authService");
      await authService.deleteAccount();
      toast.success("Account deleted");
      logout();
      navigate(ROUTES.landing);
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ paddingBottom: "32px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "26px", margin: "0 0 24px", color: "var(--color-dark)" }}>
        ⚙ Settings
      </h1>

      <Card padding="md" style={{ marginBottom: "20px" }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "16px", margin: "0 0 16px", color: "var(--color-dark)" }}>
          Email Notifications
        </h3>
        {loadingPrefs ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#888" }}>Loading preferences...</p>
        ) : prefs ? (
          <>
            <Toggle label="Weekly report" checked={prefs.weekly_report} onChange={() => handleToggle("weekly_report")} />
            <Toggle label="Contest reminders" checked={prefs.contest_reminder} onChange={() => handleToggle("contest_reminder")} />
            <Toggle label="Streak alerts" checked={prefs.streak_alert} onChange={() => handleToggle("streak_alert")} />
            <Toggle label="Achievement alerts" checked={prefs.achievement_alert} onChange={() => handleToggle("achievement_alert")} />
            <Button size="sm" loading={savingPrefs} onClick={handleSavePrefs} style={{ marginTop: "8px" }}>
              Save Preferences
            </Button>
          </>
        ) : (
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#888" }}>Could not load preferences.</p>
        )}
      </Card>

      <Card padding="md" style={{ marginBottom: "20px" }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "16px", margin: "0 0 16px", color: "var(--color-dark)" }}>
          Change Password
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: 360 }}>
          <input type="password" placeholder="Current password" value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: "10px", border: "2px solid #000", fontFamily: "var(--font-body)", fontSize: "13px", outline: "none" }}
          />
          <input type="password" placeholder="New password (min 8 chars)" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: "10px", border: "2px solid #000", fontFamily: "var(--font-body)", fontSize: "13px", outline: "none" }}
          />
          <Button size="sm" loading={changingPassword} onClick={handleChangePassword}>Change Password</Button>
        </div>
      </Card>

      <Card padding="md" style={{ marginBottom: "20px" }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "16px", margin: "0 0 16px", color: "var(--color-dark)" }}>
          Export Data
        </h3>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => handleExport("json")}
            style={{ padding: "8px 16px", borderRadius: "10px", border: "2px solid #000", background: "#FFD93D", boxShadow: "3px 3px 0 #000", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "12px", cursor: "pointer", color: "var(--color-dark)" }}>
            Export JSON
          </button>
          <button onClick={() => handleExport("pdf")}
            style={{ padding: "8px 16px", borderRadius: "10px", border: "2px solid #000", background: "#FFD93D", boxShadow: "3px 3px 0 #000", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "12px", cursor: "pointer", color: "var(--color-dark)" }}>
            Export PDF
          </button>
          <button onClick={() => handleExport("png")}
            style={{ padding: "8px 16px", borderRadius: "10px", border: "2px solid #000", background: "#FFD93D", boxShadow: "3px 3px 0 #000", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "12px", cursor: "pointer", color: "var(--color-dark)" }}>
            Export PNG
          </button>
        </div>
      </Card>

      <Card padding="md" style={{ border: "3px solid #FF4757" }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "16px", margin: "0 0 8px", color: "#FF4757" }}>
          Danger Zone
        </h3>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#888", margin: "0 0 12px" }}>
          Once you delete your account, there is no going back. All your data will be permanently removed.
        </p>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input type="text" placeholder='Type "DELETE" to confirm' value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
            style={{ flex: 1, padding: "10px 12px", borderRadius: "10px", border: "2px solid #FF4757", fontFamily: "var(--font-body)", fontSize: "13px", outline: "none", maxWidth: 200 }}
          />
          <Button size="sm" variant="danger" loading={deleting} onClick={handleDeleteAccount}
            disabled={confirmDelete !== "DELETE"}>
            Delete Account
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export default Settings;
