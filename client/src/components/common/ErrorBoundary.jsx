import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "40px",
            fontFamily: "'Inter', sans-serif",
            background: "#FFF9F0",
          }}
        >
          <div
            style={{
              borderRadius: "16px",
              border: "3px solid #000",
              boxShadow: "6px 6px 0 #000",
              padding: "48px",
              maxWidth: "480px",
              textAlign: "center",
              background: "#fff",
            }}
          >
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "48px",
                margin: "0 0 16px",
              }}
            >
              ⚠️
            </h1>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                margin: "0 0 8px",
              }}
            >
              Something went wrong
            </h2>
            <p style={{ color: "#666", margin: "0 0 24px", lineHeight: 1.5 }}>
              An unexpected error occurred. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 32px",
                borderRadius: "12px",
                border: "3px solid #000",
                background: "#FFD93D",
                boxShadow: "6px 6px 0 #000",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
