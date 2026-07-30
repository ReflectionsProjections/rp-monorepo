import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
  componentStack: string | null;
};

/**
 * Without this, a throw during render unmounts the tree and leaves a blank
 * page with the cause only visible in the console. Shows the error instead.
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null, componentStack: null };

  static getDerivedStateFromError(error: Error) {
    return { error, componentStack: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled render error", error, errorInfo.componentStack);
    this.setState({ componentStack: errorInfo.componentStack ?? null });
  }

  render() {
    const { error, componentStack } = this.state;

    if (!error) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#100e0e",
          color: "#FCF2F6",
          padding: "48px 24px",
          fontFamily: "monospace",
          overflowX: "auto"
        }}
      >
        <h1 style={{ fontSize: "20px", marginBottom: "16px" }}>
          Something broke while rendering this page.
        </h1>
        <p style={{ color: "#FFB4D1", marginBottom: "24px" }}>
          {import.meta.env.DEV
            ? `${error.name}: ${error.message}`
            : "Please try again, or head back to the homepage."}
        </p>
        {import.meta.env.DEV && componentStack && (
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontSize: "12px",
              opacity: 0.75,
              marginBottom: "24px"
            }}
          >
            {componentStack}
          </pre>
        )}
        <a href="/" style={{ color: "#FCF2F6", textDecoration: "underline" }}>
          Back to R|P 2026
        </a>
      </div>
    );
  }
}
