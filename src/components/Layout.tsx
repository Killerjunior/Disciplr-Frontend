import { Link } from 'react-router-dom';
import NavLink from './NavLink';
import { WalletConnectButton } from './Wallet/WalletConnectButton';
import { Text } from './Text';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="site-header">
        <div className="header-brand">
          <Link to="/" className="header-link" aria-label="Disciplr home">
            <Text role="title" as="span">Disciplr</Text>
          </Link>
          <NavLink to="/transactions" className="header-link" ariaLabel="Transactions">
            Transactions
          </NavLink>
        </div>

        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NavLink to="/" className="header-link" ariaLabel="Home">
              <Text role="caption" as="span">Home</Text>
            </NavLink>
            <NavLink to="/analytics" className="header-link" ariaLabel="Analytics">
              Analytics
            </NavLink>
            <Link
              to="/vaults/create"
              style={{
                color: 'var(--surface)',
                background: 'var(--accent)',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            >
              Create Vault
            </Link>
            <WalletConnectButton />
          </div>
        </nav>
      </header>

      <main
        style={{
          flex: 1,
          padding: 'var(--spacing-8)',
          maxWidth: 960,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {children}
      </main>
    </div>
  );
}
