import { Link } from 'react-router-dom'
import { Text } from '../components/Text'
import { WalletConnectButton } from '../components/Wallet/WalletConnectButton'
import { Shield, Zap, Lock } from 'lucide-react'

export default function Home() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-4)' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: 'var(--space-12)', paddingTop: 'var(--space-8)' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Shield size={64} style={{ color: 'var(--primary)', marginBottom: 'var(--space-4)' }} />
        </div>
        <Text role="display" as="h1" style={{ marginBottom: 'var(--space-4)', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
          Stake & Secure Your Goals with Disciplr
        </Text>
        <Text role="body" as="p" style={{ color: 'var(--muted)', marginBottom: 'var(--space-8)', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', fontSize: 'var(--text-lg)' }}>
          Time‑locked capital vaults on Stellar that release on validation or redirect on failure.
        </Text>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          <Link
            to="/vaults/create"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Create Your First Vault
          </Link>
          <Link
            to="/dashboard"
            style={{
              color: 'var(--primary)',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: 'var(--text-base)',
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/vaults"
            style={{
              color: 'var(--primary)',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: 'var(--text-base)',
            }}
          >
            My Vaults
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ marginBottom: 'var(--space-12)' }}>
        <Text role="title" as="h2" style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          How It Works
        </Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-6)' }}>
          <div style={{ textAlign: 'center', padding: 'var(--space-6)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <Zap size={32} style={{ color: 'var(--primary)' }} />
            </div>
            <Text role="subtitle" as="h3" style={{ marginBottom: 'var(--space-2)' }}>
              1. Connect Your Wallet
            </Text>
            <Text role="body" as="p" style={{ color: 'var(--muted)' }}>
              Link your Stellar wallet securely to get started.
            </Text>
          </div>
          <div style={{ textAlign: 'center', padding: 'var(--space-6)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <Lock size={32} style={{ color: 'var(--primary)' }} />
            </div>
            <Text role="subtitle" as="h3" style={{ marginBottom: 'var(--space-2)' }}>
              2. Create a Vault
            </Text>
            <Text role="body" as="p" style={{ color: 'var(--muted)' }}>
              Deposit USDC and set your success milestones.
            </Text>
          </div>
          <div style={{ textAlign: 'center', padding: 'var(--space-6)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <Shield size={32} style={{ color: 'var(--primary)' }} />
            </div>
            <Text role="subtitle" as="h3" style={{ marginBottom: 'var(--space-2)' }}>
              3. Achieve or Redirect
            </Text>
            <Text role="body" as="p" style={{ color: 'var(--muted)' }}>
              Funds release on success or redirect automatically.
            </Text>
          </div>
        </div>
      </section>

      {/* Stellar/Soroban Context */}
      <section style={{ marginBottom: 'var(--space-12)', padding: 'var(--space-8)', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
        <Text role="title" as="h2" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          Built on Stellar & Soroban
        </Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          <div>
            <Text role="subtitle" as="h3" style={{ marginBottom: 'var(--space-2)' }}>
              Why Stellar?
            </Text>
            <Text role="body" as="p" style={{ color: 'var(--muted)' }}>
              Fast, low-cost transactions enable global, borderless finance. Trusted by millions for secure asset transfers.
            </Text>
          </div>
          <div>
            <Text role="subtitle" as="h3" style={{ marginBottom: 'var(--space-2)' }}>
              Why Soroban?
            </Text>
            <Text role="body" as="p" style={{ color: 'var(--muted)' }}>
              Smart contracts bring programmability to money. Automate complex financial agreements with rock-solid security.
            </Text>
          </div>
        </div>
        <details style={{ marginTop: 'var(--space-4)' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 500, color: 'var(--primary)' }}>
            Learn more about Stellar and Soroban
          </summary>
          <Text role="body" as="p" style={{ marginTop: 'var(--space-2)', color: 'var(--muted)' }}>
            Stellar is a decentralized network for fast, low-cost cross-border payments. Soroban extends it with smart contract capabilities, making it ideal for programmable finance like Disciplr.
          </Text>
        </details>
      </section>

      {/* Trust/Social Proof */}
      <section style={{ marginBottom: 'var(--space-12)', textAlign: 'center' }}>
        <Text role="title" as="h2" style={{ marginBottom: 'var(--space-6)' }}>
          Trusted & Secure
        </Text>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-8)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          <div style={{ padding: 'var(--space-4)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <Shield size={24} style={{ color: 'var(--success)' }} />
            <Text role="body" as="p" style={{ marginTop: 'var(--space-2)' }}>Audited Smart Contracts</Text>
          </div>
          <div style={{ padding: 'var(--space-4)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <Lock size={24} style={{ color: 'var(--success)' }} />
            <Text role="body" as="p" style={{ marginTop: 'var(--space-2)' }}>Non-Custodial</Text>
          </div>
          <div style={{ padding: 'var(--space-4)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <Zap size={24} style={{ color: 'var(--success)' }} />
            <Text role="body" as="p" style={{ marginTop: 'var(--space-2)' }}>Instant Settlements</Text>
          </div>
        </div>
        <Text role="body" as="p" style={{ color: 'var(--muted)', maxWidth: '600px', margin: '0 auto' }}>
          Disciplr leverages Stellar's proven infrastructure, used by organizations worldwide for secure financial operations.
        </Text>
      </section>

      {/* Final CTA */}
      <section style={{ textAlign: 'center', padding: 'var(--space-8)', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius)' }}>
        <Text role="title" as="h2" style={{ marginBottom: 'var(--space-4)', color: 'white' }}>
          Ready to Secure Your Future?
        </Text>
        <Text role="body" as="p" style={{ marginBottom: 'var(--space-6)', opacity: 0.9 }}>
          Join thousands building unstoppable financial discipline.
        </Text>
        <WalletConnectButton />
      </section>
    </div>
  )
}
