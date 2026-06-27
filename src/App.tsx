import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './context/WalletContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import Skeleton from './components/Skeleton'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Vaults from './pages/Vaults'
import CreateVault from './pages/CreateVault'
import VaultDetail from './pages/VaultDetail'
import VaultTransactions from './pages/VaultTransactions'
import VerifierDashboard from './pages/VerifierDashboard'
import PendingValidations from './pages/PendingValidations'
import ValidationDetail from './pages/ValidationDetail'
import ValidationHistory from './pages/ValidationHistory'
import NotFound from './pages/NotFound'

const Analytics = lazy(() => import('./pages/Analytics'))
const Notification = lazy(() => import('./pages/Notification'))

const PageFallback = <Skeleton className="w-full h-screen" />

export default function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/vaults" element={<Vaults />} />
                <Route path="/vaults/create" element={<CreateVault />} />
                <Route path="/vaults/:id" element={<VaultDetail />} />
                <Route path="/vaults/:id/transactions" element={<VaultTransactions />} />
                <Route path="/transactions" element={<VaultTransactions />} />
                <Route path="/verifier" element={<VerifierDashboard />} />
                <Route path="/verifier/queue" element={<PendingValidations />} />
                <Route path="/verifier/queue/:vaultId" element={<ValidationDetail />} />
                <Route path="/verifier/history" element={<ValidationHistory />} />
                <Route
                  path="/analytics"
                  element={
                    <Suspense fallback={PageFallback}>
                      <Analytics />
                    </Suspense>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <Suspense fallback={PageFallback}>
                      <Notification />
                    </Suspense>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </ErrorBoundary>
        </BrowserRouter>
      </WalletProvider>
    </ThemeProvider>
  )
}
