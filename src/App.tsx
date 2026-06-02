import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './context/WalletContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'

// Existing Page Imports
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Vaults from './pages/Vaults'
import CreateVault from './pages/CreateVault'
import VaultDetail from './pages/VaultDetail'
import VaultTransactions from './pages/VaultTransactions';

          <Route path="/transactions" element={<VaultTransactions />} />


// New Verifier Page Imports
import VerifierDashboard from './pages/VerifierDashboard'
import PendingValidations from './pages/PendingValidations'
import ValidationDetail from './pages/ValidationDetail'
import ValidationHistory from './pages/ValidationHistory'

export default function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <BrowserRouter>
          {/* Layout handles the global wrapper, header, and sidebar */}
          <Layout>
            <Routes>
              {/* Existing Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vaults" element={<Vaults />} />
              <Route path="/vaults/create" element={<CreateVault />} />
              <Route path="/vaults/:id" element={<VaultDetail />} />
              <Route path="/vaults/:id/transactions" element={<VaultTransactions />} />
              
              {/* New Verifier Routes */}
              <Route path="/verifier" element={<VerifierDashboard />} />
              <Route path="/verifier/queue" element={<PendingValidations />} />
              <Route path="/verifier/queue/:vaultId" element={<ValidationDetail />} />
              <Route path="/verifier/history" element={<ValidationHistory />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </WalletProvider>
    </ThemeProvider>
  )
}