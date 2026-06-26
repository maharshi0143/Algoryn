import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import { authService } from "../services/authService";
import { ROUTES } from "../constants/routes";

function Loader() {
  return (
    <svg width={32} height={32} viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto" }}>
      <circle cx="12" cy="12" r="10" stroke="#E0E0E0" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#FFD93D" strokeWidth="3" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    let cancelled = false;

    authService
      .verifyEmail(token)
      .then(() => {
        if (!cancelled) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            err.response?.data?.message ||
              "This link has expired or is invalid."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: "#fff",
        border: "3px solid #000",
        borderRadius: "16px",
        boxShadow: "6px 6px 0 #000",
        padding: "32px",
        textAlign: "center",
      }}
    >
      {status === "loading" && (
        <>
          <Loader />
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: "18px",
              color: "var(--color-dark)",
              margin: "20px 0 0",
            }}
          >
            Verifying your email...
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#6BCB77",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
          >
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "22px",
              margin: "20px 0 8px",
              color: "var(--color-dark)",
            }}
          >
            Email Verified!
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "#666",
              margin: "0 0 24px",
            }}
          >
            {message}
          </p>
          <Button onClick={() => navigate(ROUTES.login)}>Go to Login</Button>
        </>
      )}

      {status === "error" && (
        <>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#FF4757",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
          >
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "22px",
              margin: "20px 0 8px",
              color: "var(--color-dark)",
            }}
          >
            Verification Failed
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "#666",
              margin: "0 0 24px",
            }}
          >
            {message}
          </p>
          <Link
            to={ROUTES.register}
            style={{
              display: "inline-block",
              padding: "12px 32px",
              borderRadius: "16px",
              border: "3px solid #000",
              background: "#FFD93D",
              boxShadow: "6px 6px 0 #000",
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "15px",
              color: "#121212",
              textDecoration: "none",
            }}
          >
            Resend Email
          </Link>
        </>
      )}
    </motion.div>
  );
}

export default VerifyEmail;
