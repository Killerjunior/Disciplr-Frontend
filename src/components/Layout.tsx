import { Link, useLocation } from "react-router-dom";
import { WalletConnectButton } from "./Wallet/WalletConnectButton";
import { Text } from "./Text";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = () => setDrawerOpen(prev => !prev);
  const location = useLocation();

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <header className="site-header">
        <div className="header-brand">
          <Link to="/" className="header-link" aria-label="Disciplr home">
            <Text role="title" as="span">
              Disciplr
            </Text>
          </Link>
          <Link
            to="/transactions"
            className="header-link"
            style={{
              color:
                location.pathname === "/transactions"
                  ? "var(--accent)"
                  : "var(--muted)",
            }}
            aria-label="Transactions"
          >
            <span className="header-transactions-label">Transactions</span>
            {/* Icon fallback on very small screens */}
            <span
              aria-hidden="true"
              className="header-transactions-icon"
              style={{ display: "none" }}
            >
              ↗
            </span>
          </Link>
        </div>

        <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link
              to="/"
              className="header-link"
              style={{
                color:
                  location.pathname === "/" ? "var(--accent)" : "var(--muted)",
              }}
            >
              <Text role="caption" as="span">
                Home
              </Text>
            </Link>

            <Link
              to="/analytics"
              style={{
                color:
                  location.pathname === "/analytics"
                    ? "var(--accent)"
                    : "var(--muted)",
                textDecoration: "none",
              }}
            >
              Analytics
            </Link>

            <Link
              to="/vaults/create"
              style={{
                color: "var(--surface)",
                background: "var(--accent)",
                padding: "0.5rem 1rem",
                borderRadius: "9999px",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
              }}
            >
              Create Vault
            </Link>
            <WalletConnectButton />
          </div>
        </nav>
        <MobileDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} />
      </header>

      <main
        style={{
          flex: 1,
          padding: "var(--spacing-8)",
          maxWidth: "var(--container-standard)",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {children}
      </main>
    </div>
  );
}
