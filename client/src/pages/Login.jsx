import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import useAuthStore from "../store/authStore";
import { authService } from "../services/authService";
import { ROUTES } from "../constants/routes";

function MailIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function validate(field, value) {
  switch (field) {
    case "email":
      if (!value.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
      return "";
    case "password":
      if (!value) return "Password is required";
      return "";
    default:
      return "";
  }
}

function Login() {
  const navigate = useNavigate();
  const storeLogin = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (loginError) setLoginError(null);
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    const newErrors = {
      email: validate("email", form.email),
      password: validate("password", form.password),
    };
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    if (Object.values(newErrors).some(Boolean)) return;

    setIsLoggingIn(true);
    try {
      const res = await authService.login(form.email.trim(), form.password);
      const { user, accessToken } = res.data.data;
      storeLogin(user, accessToken);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(ROUTES.welcome);
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setLoginError(message);
      toast.error(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

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
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "24px",
          margin: "0 0 8px",
          color: "var(--color-dark)",
        }}
      >
        Welcome back ⚡
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: "#666",
          margin: "0 0 24px",
        }}
      >
        Log in to continue your coding journey.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="hello@gmail.com"
          icon={MailIcon}
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email ? errors.email : undefined}
          autoComplete="email"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          icon={LockIcon}
          value={form.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password ? errors.password : undefined}
          autoComplete="current-password"
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "4px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "#aaa",
              cursor: "not-allowed",
            }}
          >
            Forgot Password?
          </span>
        </div>

        <Button type="submit" loading={isLoggingIn}>
          Login ⚡
        </Button>
      </form>

      <p
        style={{
          textAlign: "center",
          margin: "16px 0 0",
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: "#666",
        }}
      >
        Don&apos;t have an account?{" "}
        <Link
          to={ROUTES.register}
          style={{
            color: "var(--color-dark)",
            fontWeight: 600,
            textDecoration: "underline",
            textUnderlineOffset: "2px",
          }}
        >
          Register
        </Link>
      </p>
    </motion.div>
  );
}

export default Login;
