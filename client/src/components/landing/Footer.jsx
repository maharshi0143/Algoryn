import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

const footerLinks = {
  Product: [
    { label: "Features", to: "#features" },
    { label: "Dashboard", to: ROUTES.dashboard },
  ],
  Company: [
    { label: "About", to: "#" },
    { label: "Blog", to: "#" },
  ],
  Legal: [
    { label: "Privacy", to: "#" },
    { label: "Terms", to: "#" },
  ],
};

function Footer() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.footer
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      style={{
        padding: "48px 40px 24px",
        background: "#fff",
        borderTop: "3px solid #000",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "48px",
          maxWidth: "960px",
          margin: "0 auto",
        }}
      >
        {/* Brand */}
        <div style={{ flex: "1 1 240px" }}>
          <Link
            to={ROUTES.landing}
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "24px",
              color: "var(--color-dark)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "24px" }}>
              <span style={{ color: "var(--color-primary)" }}>A</span>lgoryn
            </span>
          </Link>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "#888",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Your Personal Developer HQ.
            <br />
            Track, improve, and compete.
          </p>
        </div>

        {/* Link Groups */}
        {Object.entries(footerLinks).map(([group, links]) => (
          <div key={group} style={{ flex: "1 1 120px" }}>
            <h4
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "14px",
                margin: "0 0 12px",
                color: "var(--color-dark)",
              }}
            >
              {group}
            </h4>
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                style={{
                  display: "block",
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  color: "#888",
                  textDecoration: "none",
                  marginBottom: "8px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--color-dark)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#888")
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: "960px",
          margin: "32px auto 0",
          paddingTop: "16px",
          borderTop: "2px solid #E8E8E8",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "#aaa",
          }}
        >
          © 2026 Algoryn. All rights reserved.
        </span>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <a href="https://www.instagram.com/maharshidv/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ transition: "opacity 0.2s", display: "flex" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.7)} onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF6B9A">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="#FF6B9A"/>
              <circle cx="12" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="1.5"/>
              <circle cx="17.5" cy="6.5" r="1.5" fill="#fff"/>
            </svg>
          </a>
          <a href="https://github.com/maharshi0143" target="_blank" rel="noopener noreferrer" aria-label="GitHub" style={{ transition: "opacity 0.2s", display: "flex" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.7)} onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#181717"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
          <a href="https://www.linkedin.com/in/denuvakonda-maharshi-4a6195292" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ transition: "opacity 0.2s", display: "flex" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.7)} onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
