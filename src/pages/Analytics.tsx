import { useEffect, useMemo, useState } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Target, TrendingUp, CheckCircle, AlertTriangle,
  Download, Flame, Award, Clock, DollarSign,
  ArrowUpRight, ArrowDownRight, Zap, Flag, BarChart2,
  Users, Lock, Crown
} from 'lucide-react'
import jsPDF from 'jspdf'
import { useTheme } from '../context/ThemeContext'
import { buildAnalyticsSeriesColors, getAnalyticsChartTokens } from './analyticsTheme'

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = '7d' | '30d' | '90d' | '1y' | 'All'

function useAnalyticsChartTokens() {
  const { theme } = useTheme()
  const [tokens, setTokens] = useState(() => getAnalyticsChartTokens())

  useEffect(() => {
    const root = document.documentElement
    const syncTokens = () => setTokens(getAnalyticsChartTokens(root))
    syncTokens()

    const observer = new MutationObserver(syncTokens)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })

    return () => observer.disconnect()
  }, [theme])

  return tokens
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches)
    syncPreference()
    mediaQuery.addEventListener('change', syncPreference)
    return () => mediaQuery.removeEventListener('change', syncPreference)
  }, [])

  return prefersReducedMotion
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const allData: Record<Period, { name: string; success: number; failed: number; capital: number; milestones: number }[]> = {
  '7d': [
    { name: 'Mon', success: 80, failed: 20, capital: 2800, milestones: 2 },
    { name: 'Tue', success: 85, failed: 15, capital: 2900, milestones: 3 },
    { name: 'Wed', success: 78, failed: 22, capital: 2750, milestones: 2 },
    { name: 'Thu', success: 90, failed: 10, capital: 3100, milestones: 4 },
    { name: 'Fri', success: 88, failed: 12, capital: 3050, milestones: 3 },
    { name: 'Sat', success: 92, failed: 8,  capital: 3200, milestones: 5 },
    { name: 'Sun', success: 87, failed: 13, capital: 3150, milestones: 3 },
  ],
  '30d': [
    { name: 'Wk1', success: 65, failed: 35, capital: 800,  milestones: 3 },
    { name: 'Wk2', success: 70, failed: 30, capital: 1200, milestones: 5 },
    { name: 'Wk3', success: 80, failed: 20, capital: 2100, milestones: 6 },
    { name: 'Wk4', success: 88, failed: 12, capital: 3200, milestones: 9 },
  ],
  '90d': [
    { name: 'Jan', success: 65, failed: 35, capital: 800,  milestones: 3 },
    { name: 'Feb', success: 70, failed: 30, capital: 1200, milestones: 5 },
    { name: 'Mar', success: 68, failed: 32, capital: 950,  milestones: 4 },
  ],
  '1y': [
    { name: 'Jan', success: 65, failed: 35, capital: 800,  milestones: 3 },
    { name: 'Feb', success: 70, failed: 30, capital: 1200, milestones: 5 },
    { name: 'Mar', success: 68, failed: 32, capital: 950,  milestones: 4 },
    { name: 'Apr', success: 85, failed: 15, capital: 1800, milestones: 7 },
    { name: 'May', success: 88, failed: 12, capital: 2400, milestones: 6 },
    { name: 'Jun', success: 92, failed: 8,  capital: 3200, milestones: 9 },
    { name: 'Jul', success: 89, failed: 11, capital: 3000, milestones: 8 },
    { name: 'Aug', success: 91, failed: 9,  capital: 3400, milestones: 10 },
    { name: 'Sep', success: 86, failed: 14, capital: 2900, milestones: 7 },
    { name: 'Oct', success: 93, failed: 7,  capital: 3800, milestones: 11 },
    { name: 'Nov', success: 90, failed: 10, capital: 3500, milestones: 9 },
    { name: 'Dec', success: 95, failed: 5,  capital: 4200, milestones: 13 },
  ],
  'All': [
    { name: '2023', success: 60, failed: 40, capital: 500,  milestones: 2 },
    { name: '2024', success: 75, failed: 25, capital: 2100, milestones: 6 },
    { name: '2025', success: 88, failed: 12, capital: 4200, milestones: 9 },
  ],
}

// Previous period data for comparison
const prevPeriodData: Record<Period, { name: string; success: number; capital: number }[]> = {
  '7d': [
    { name: 'Mon', success: 60, capital: 2000 },
    { name: 'Tue', success: 65, capital: 2100 },
    { name: 'Wed', success: 70, capital: 2200 },
    { name: 'Thu', success: 72, capital: 2300 },
    { name: 'Fri', success: 68, capital: 2150 },
    { name: 'Sat', success: 75, capital: 2400 },
    { name: 'Sun', success: 71, capital: 2350 },
  ],
  '30d': [
    { name: 'Wk1', success: 50, capital: 500 },
    { name: 'Wk2', success: 58, capital: 750 },
    { name: 'Wk3', success: 62, capital: 1100 },
    { name: 'Wk4', success: 70, capital: 1800 },
  ],
  '90d': [
    { name: 'Oct', success: 55, capital: 600 },
    { name: 'Nov', success: 60, capital: 800 },
    { name: 'Dec', success: 63, capital: 700 },
  ],
  '1y': [
    { name: 'Jan', success: 45, capital: 400 },
    { name: 'Feb', success: 50, capital: 600 },
    { name: 'Mar', success: 48, capital: 500 },
    { name: 'Apr', success: 65, capital: 900 },
    { name: 'May', success: 68, capital: 1200 },
    { name: 'Jun', success: 72, capital: 1800 },
    { name: 'Jul', success: 70, capital: 1600 },
    { name: 'Aug', success: 74, capital: 2000 },
    { name: 'Sep', success: 69, capital: 1700 },
    { name: 'Oct', success: 78, capital: 2200 },
    { name: 'Nov', success: 75, capital: 2000 },
    { name: 'Dec', success: 80, capital: 2500 },
  ],
  'All': [
    { name: '2021', success: 40, capital: 200 },
    { name: '2022', success: 52, capital: 800 },
    { name: '2023', success: 60, capital: 1200 },
  ],
}

const vaultStatusData = [
  { name: 'Completed', value: 14 },
  { name: 'Active', value: 3 },
  { name: 'Failed', value: 4 },
]
const milestoneTypes = [
  { type: 'Daily Exercise', count: 12 },
  { type: 'Study Goal', count: 9 },
  { type: 'No Spending', count: 7 },
  { type: 'Reading', count: 5 },
  { type: 'Sleep Schedule', count: 3 },
]

// Benchmarking data
const benchmarkData = [
  { metric: 'Success Rate', you: 85, platform: 68 },
  { metric: 'Avg Duration', you: 18, platform: 14 },
  { metric: 'Streak', you: 5, platform: 3 },
  { metric: 'Milestones/mo', you: 9, platform: 5 },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1.5rem',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1.25rem 0', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </h2>
  )
}

function ChartTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1.25rem 0' }}>
      {children}
    </h3>
  )
} 

function ChartSummary({ children }: { children: React.ReactNode }) {
  return <p className="sr-only">{children}</p>
}

function SkeletonBox({ height = 220 }: { height?: number }) {
  return (
    <div style={{
      height,
      background: 'var(--border)',
      borderRadius: 'var(--radius)',
      animation: 'disciplr-pulse 1.5s ease-in-out infinite',
    }} />
  )
}

function EmptyState({ message = 'No data yet. Create your first vault to see analytics.' }: { message?: string }) {
  return (
    <div style={{
      padding: '2.5rem',
      textAlign: 'center',
      color: 'var(--muted)',
      border: '1px dashed var(--border)',
      borderRadius: 'var(--radius)',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
      <div style={{ fontSize: '0.9rem' }}>{message}</div>
    </div>
  )
}

// ─── Export Helpers ───────────────────────────────────────────────────────────

function exportCSV(data: typeof allData['30d']) {
  const headers = ['Period', 'Success %', 'Failed %', 'Capital (USDC)', 'Milestones']
  const rows = data.map(d => [d.name, d.success, d.failed, d.capital, d.milestones])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'disciplr-analytics.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function exportPDF(period: Period, data: typeof allData['30d']) {
  const doc = new jsPDF()
  const accent = [0, 195, 137] as const

  // Header bar
  doc.setFillColor(...accent)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Disciplr Analytics Report', 14, 18)

  // Period & date
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Period: ${period}   •   Generated: ${new Date().toLocaleDateString()}`, 14, 24)

  // Key metrics section
  doc.setTextColor(30, 45, 66)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Key Metrics', 14, 42)

  const metrics = [
    ['Total Capital Locked', '$12,450 USDC'],
    ['Active Capital', '$3,200 USDC'],
    ['Success Rate', '85%'],
    ['Total Vaults', '21'],
    ['Completed / Failed', '14 / 4'],
    ['Accountability Score', '82 / 100'],
  ]

  doc.setFontSize(10)
  metrics.forEach(([label, value], i) => {
    const col = i % 2 === 0 ? 14 : 110
    const row = 52 + Math.floor(i / 2) * 14
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 110, 130)
    doc.text(label, col, row)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20, 20, 30)
    doc.text(value, col, row + 6)
  })

  // Divider
  doc.setDrawColor(...accent)
  doc.setLineWidth(0.5)
  doc.line(14, 94, 196, 94)

  // Performance data table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(30, 45, 66)
  doc.text('Performance Data', 14, 106)

  // Table header
  doc.setFillColor(240, 250, 247)
  doc.rect(14, 112, 182, 9, 'F')
  doc.setFontSize(9)
  doc.setTextColor(0, 195, 137)
  doc.text('PERIOD', 17, 118)
  doc.text('SUCCESS %', 60, 118)
  doc.text('FAILED %', 100, 118)
  doc.text('CAPITAL (USDC)', 135, 118)
  doc.text('MILESTONES', 175, 118)

  // Table rows
  data.forEach((row, i) => {
    const y = 128 + i * 10
    if (i % 2 === 0) {
      doc.setFillColor(249, 252, 251)
      doc.rect(14, y - 5, 182, 10, 'F')
    }
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 45, 66)
    doc.text(row.name, 17, y)
    doc.setTextColor(0, 155, 110)
    doc.text(`${row.success}%`, 60, y)
    doc.setTextColor(200, 60, 55)
    doc.text(`${row.failed}%`, 100, y)
    doc.setTextColor(30, 45, 66)
    doc.text(`$${row.capital.toLocaleString()}`, 135, y)
    doc.text(`${row.milestones}`, 175, y)
  })

  // Capital flow
  const tableEnd = 128 + data.length * 10 + 10
  doc.setDrawColor(...accent)
  doc.line(14, tableEnd, 196, tableEnd)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(30, 45, 66)
  doc.text('Capital Flow Summary', 14, tableEnd + 12)

  const flow = [
    ['Released to Success Destinations', '$8,750 USDC', [0, 155, 110] as const],
    ['Redirected on Failure', '$2,400 USDC', [200, 60, 55] as const],
    ['Platform Fee (1%)', '$124 USDC', [100, 110, 130] as const],
  ]

  flow.forEach(([label, value, color], i) => {
    const y = tableEnd + 24 + i * 12
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100, 110, 130)
    doc.text(label as string, 17, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...(color as [number, number, number]))
    doc.text(value as string, 150, y)
  })

  // Footer
  doc.setFillColor(245, 248, 250)
  doc.rect(0, 278, 210, 20, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(150, 160, 175)
  doc.text('Generated by Disciplr — Accountability on Stellar', 14, 288)
  doc.text(`Page 1 of 1`, 185, 288)

  doc.save(`disciplr-report-${period}.pdf`)
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Analytics() {
  const chartTokens = useAnalyticsChartTokens()
  const seriesColors = useMemo(() => buildAnalyticsSeriesColors(chartTokens), [chartTokens])
  const prefersReducedMotion = usePrefersReducedMotion()
  const [period, setPeriod] = useState<Period>('30d')
  const [showComparison, setShowComparison] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [goalRate, setGoalRate] = useState('90')
  const [goalCapital, setGoalCapital] = useState('5000')
  const [isLoading] = useState(false)
  const hasData = true

  const PERIODS: Period[] = ['7d', '30d', '90d', '1y', 'All']
  const chartData = allData[period]

  // Merge current + previous period for comparison charts
  const comparisonData = chartData.map((d, i) => ({
    ...d,
    prevSuccess: prevPeriodData[period][i]?.success ?? 0,
    prevCapital: prevPeriodData[period][i]?.capital ?? 0,
  }))

  const displayData = showComparison ? comparisonData : chartData
  const chartAnimationEnabled = !prefersReducedMotion
  const tooltipStyle = useMemo(() => ({
    contentStyle: {
      background: seriesColors.tooltipBackground,
      border: `1px solid ${seriesColors.tooltipBorder}`,
      borderRadius: '10px',
      color: seriesColors.tooltipText,
      fontSize: '0.85rem',
    },
    itemStyle: { color: seriesColors.tooltipText },
    labelStyle: { color: seriesColors.tooltipMuted },
  }), [seriesColors])

  return (
    <>
      <style>{`
        @keyframes disciplr-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.65; }
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        .period-btn {
          padding: 0.45rem 1.1rem;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--muted);
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.15s;
        }
        .period-btn:hover { border-color: var(--accent); color: var(--accent); }
        .period-btn.active {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--bg);
          font-weight: 700;
        }
        .toggle-btn {
          padding: 0.45rem 1rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--muted);
          cursor: pointer;
          font-size: 0.82rem;
          transition: all 0.15s;
        }
        .toggle-btn.active {
          border-color: var(--info);
          color: var(--info);
          background: var(--accent-transparent);
        }
        .action-btn {
          padding: 0.45rem 1rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          cursor: pointer;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.15s;
        }
        .action-btn:hover { border-color: var(--accent); color: var(--accent); }
        input[type="date"] {
          background: var(--surface);
          color: var(--text);
          border: 1px solid var(--border);
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius);
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
        }
        input[type="number"] {
          background: var(--surface);
          color: var(--text);
          border: 1px solid var(--border);
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius);
          font-size: 0.9rem;
          outline: none;
          width: 100%;
        }
        input[type="number"]:focus { border-color: var(--accent); }
        @media (max-width: 640px) {
          .chart-grid { grid-template-columns: 1fr !important; }
          .metrics-grid { grid-template-columns: 1fr 1fr !important; }
          .insights-grid { grid-template-columns: 1fr 1fr !important; }
          .flow-grid { grid-template-columns: 1fr !important; }
          .bench-grid { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .disciplr-progress-bar,
          .period-btn,
          .toggle-btn,
          .action-btn {
            transition: none !important;
            animation: none !important;
          }
          [style*="disciplr-pulse"] {
            animation: none !important;
          }
        }
      `}</style>

      <div style={{ padding: '0.25rem 0 2rem' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.9rem', margin: '0 0 0.35rem 0' }}>Analytics</h1>
          <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.9rem' }}>
            Track your vault performance and accountability patterns.
          </p>
        </div>

        {/* ── Controls Bar ── */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '1rem 1.25rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}>
          {/* Period Toggle Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {PERIODS.map(p => (
              <button
                key={p}
                className={`period-btn${period === p ? ' active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 0.25rem' }} />

          {/* Custom Date Range */}
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Custom:</span>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
            <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>→</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} />
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 0.25rem' }} />

          {/* Compare Toggle */}
          <button
            className={`toggle-btn${showComparison ? ' active' : ''}`}
            onClick={() => setShowComparison(v => !v)}
          >
            {showComparison ? '✓' : ''} Compare Periods
          </button>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Export Buttons */}
          <button className="action-btn" onClick={() => exportCSV(chartData)}>
            <Download size={14} /> CSV
          </button>
          <button className="action-btn" onClick={() => exportPDF(period, chartData)}>
            <Download size={14} /> PDF Report
          </button>
        </div>

        {/* ── SECTION 1: Key Metrics Cards ── */}
        <div style={{ marginBottom: '2rem' }}>
          <SectionTitle>Key Metrics</SectionTitle>
          <div
            className="metrics-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}
          >
            {[
              { label: 'Total Capital Locked', value: '$12,450', sub: 'USDC · All time', icon: <Target size={17} color={seriesColors.success} />, up: true },
              { label: 'Active Capital', value: '$3,200', sub: 'USDC · Right now', icon: <TrendingUp size={17} color={seriesColors.active} />, up: true },
              { label: 'Success Rate', value: '85%', sub: '+7% vs last period', icon: <CheckCircle size={17} color={seriesColors.success} />, up: true },
              { label: 'Total Vaults', value: '21', sub: 'Created all time', icon: <Zap size={17} color={seriesColors.success} />, up: true },
              { label: 'Completed / Failed', value: '14 / 4', sub: '3 currently active', icon: <AlertTriangle size={17} color={seriesColors.failed} />, up: false },
            ].map((stat, i) => (
              <Card key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.78rem', lineHeight: 1.3 }}>{stat.label}</span>
                  {stat.icon}
                </div>
                <div style={{ fontSize: '1.55rem', fontWeight: 800, marginBottom: '0.2rem' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: stat.up ? seriesColors.success : seriesColors.failed, display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                  {stat.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  {stat.sub}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* ── SECTION 2: Performance Charts ── */}
        <div style={{ marginBottom: '2rem' }}>
          <SectionTitle>Performance Charts {showComparison && <span style={{ color: seriesColors.comparison, fontSize: '0.75rem', fontWeight: 400, marginLeft: '0.5rem' }}>Comparing with previous period</span>}</SectionTitle>
          <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>

            {/* Success Rate */}
            <Card>
              <ChartTitle>Success Rate Over Time</ChartTitle>
              <ChartSummary>
                Line chart summarizing success and failure percentages for the selected {period} period.
                {showComparison ? ' Previous period success rate is included for comparison.' : ''}
              </ChartSummary>
              {isLoading ? <SkeletonBox /> : !hasData ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={displayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={seriesColors.grid} vertical={false} />
                    <XAxis dataKey="name" stroke={seriesColors.axis} tick={{ fill: seriesColors.axis, fontSize: 11 }} />
                    <YAxis stroke={seriesColors.axis} tick={{ fill: seriesColors.axis, fontSize: 11 }} unit="%" />
                    <Tooltip {...tooltipStyle} />
                    {showComparison && <Legend wrapperStyle={{ fontSize: '0.78rem' }} />}
                    <Line type="monotone" dataKey="success" stroke={seriesColors.success} strokeWidth={2.5} dot={{ r: 3, fill: seriesColors.success }} name="This Period %" isAnimationActive={chartAnimationEnabled} />
                    <Line type="monotone" dataKey="failed" stroke={seriesColors.failed} strokeWidth={2} dot={{ r: 2, fill: seriesColors.failed }} name="Failed %" strokeDasharray="4 2" isAnimationActive={chartAnimationEnabled} />
                    {showComparison && (
                      <Line type="monotone" dataKey="prevSuccess" stroke={seriesColors.comparison} strokeWidth={1.5} dot={false} name="Prev Period %" strokeDasharray="6 3" isAnimationActive={chartAnimationEnabled} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Capital Locked */}
            <Card>
              <ChartTitle>Capital Locked Over Time</ChartTitle>
              <ChartSummary>
                Area chart showing USDC capital locked over the selected {period} period.
                {showComparison ? ' Previous period capital is shown as a comparison area.' : ''}
              </ChartSummary>
              {isLoading ? <SkeletonBox /> : !hasData ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={displayData}>
                    <defs>
                      <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={seriesColors.success} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={seriesColors.success} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="prevCapGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={seriesColors.comparison} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={seriesColors.comparison} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={seriesColors.grid} vertical={false} />
                    <XAxis dataKey="name" stroke={seriesColors.axis} tick={{ fill: seriesColors.axis, fontSize: 11 }} />
                    <YAxis stroke={seriesColors.axis} tick={{ fill: seriesColors.axis, fontSize: 11 }} />
                    <Tooltip {...tooltipStyle} />
                    {showComparison && <Legend wrapperStyle={{ fontSize: '0.78rem' }} />}
                    <Area type="monotone" dataKey="capital" stroke={seriesColors.success} strokeWidth={2.5} fill="url(#capGrad)" name="USDC Locked" isAnimationActive={chartAnimationEnabled} />
                    {showComparison && (
                      <Area type="monotone" dataKey="prevCapital" stroke={seriesColors.comparison} strokeWidth={1.5} fill="url(#prevCapGrad)" name="Prev Period" strokeDasharray="5 3" isAnimationActive={chartAnimationEnabled} />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Milestone Trend */}
            <Card>
              <ChartTitle>Milestone Completion Trend</ChartTitle>
              <ChartSummary>
                Bar chart showing completed milestone counts for each point in the selected {period} period.
              </ChartSummary>
              {isLoading ? <SkeletonBox /> : !hasData ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={seriesColors.grid} vertical={false} />
                    <XAxis dataKey="name" stroke={seriesColors.axis} tick={{ fill: seriesColors.axis, fontSize: 11 }} />
                    <YAxis stroke={seriesColors.axis} tick={{ fill: seriesColors.axis, fontSize: 11 }} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="milestones" fill={seriesColors.milestone} radius={[4, 4, 0, 0]} name="Milestones Completed" isAnimationActive={chartAnimationEnabled} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

          </div>
        </div>

        {/* ── SECTION 3: Vault Analytics ── */}
        <div style={{ marginBottom: '2rem' }}>
          <SectionTitle>Vault Analytics</SectionTitle>
          <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>

            {/* Donut */}
            <Card>
              <ChartTitle>Vaults by Status</ChartTitle>
              <ChartSummary>
                Donut chart summarizing vault status counts: 14 completed, 3 active, and 4 failed.
              </ChartSummary>
              {isLoading ? <SkeletonBox height={180} /> : !hasData ? <EmptyState /> : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={vaultStatusData} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" isAnimationActive={chartAnimationEnabled}>
                        {vaultStatusData.map((_, i) => (
                          <Cell key={i} fill={seriesColors.pie[i % seriesColors.pie.length]} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginTop: '0.5rem' }}>
                    {vaultStatusData.map((entry, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: seriesColors.pie[i], display: 'inline-block' }} />
                        {entry.name} ({entry.value})
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

            {/* Vault Stats */}
            <Card>
              <ChartTitle>Vault Stats</ChartTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                  { icon: <Clock size={15} color="var(--muted)" />, label: 'Average Vault Duration', value: '18 days' },
                  { icon: <DollarSign size={15} color="var(--muted)" />, label: 'Average Vault Amount', value: '$592 USDC' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 1rem', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
                      {item.icon} {item.label}
                    </div>
                    <div style={{ fontWeight: 700 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ color: 'var(--muted)', fontSize: '0.78rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Most Common Milestone Types
              </div>
              {milestoneTypes.map((m, i) => (
                <div key={i} style={{ marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                    <span>{m.type}</span>
                    <span style={{ color: 'var(--muted)' }}>{m.count}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--border)', borderRadius: 99 }}>
                    <div className="disciplr-progress-bar" style={{ height: '100%', width: `${(m.count / 12) * 100}%`, background: seriesColors.milestone, borderRadius: 99, transition: 'width 0.4s' }} />
                  </div>
                </div>
              ))}
            </Card>

          </div>
        </div>

        {/* ── SECTION 4: Behavioral Insights ── */}
        <div style={{ marginBottom: '2rem' }}>
          <SectionTitle>Behavioral Insights</SectionTitle>
          <div className="insights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>

            <Card style={{ textAlign: 'center' }}>
              <Flame size={26} color={seriesColors.warning} style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: seriesColors.warning, lineHeight: 1 }}>5</div>
              <div style={{ fontWeight: 600, margin: '0.3rem 0 0.15rem' }}>Current Streak</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>consecutive successes 🔥</div>
            </Card>

            <Card style={{ textAlign: 'center' }}>
              <TrendingUp size={26} color={seriesColors.success} style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: seriesColors.success, lineHeight: 1 }}>June</div>
              <div style={{ fontWeight: 600, margin: '0.3rem 0 0.15rem' }}>Best Period</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>92% success rate</div>
            </Card>

            <Card style={{ textAlign: 'center' }}>
              <AlertTriangle size={26} color={seriesColors.failed} style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: seriesColors.failed, lineHeight: 1 }}>Q1</div>
              <div style={{ fontWeight: 600, margin: '0.3rem 0 0.15rem' }}>Needs Work</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>3 failed vaults Jan–Mar</div>
            </Card>

            <Card style={{ textAlign: 'center' }}>
              <Award size={26} color={seriesColors.success} style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: seriesColors.success, lineHeight: 1 }}>82</div>
              <div style={{ fontWeight: 600, margin: '0.3rem 0 0.15rem' }}>Accountability Score</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>out of 100 · Top 15%</div>
            </Card>

          </div>
        </div>

        {/* ── SECTION 5: Capital Flow ── */}
        <div style={{ marginBottom: '2rem' }}>
          <SectionTitle>Capital Flow</SectionTitle>
          <div className="flow-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.65rem' }}>
                <ArrowUpRight size={17} color={seriesColors.success} />
                <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Released to Success</span>
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: seriesColors.success }}>$8,750 USDC</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.76rem', marginTop: '0.25rem' }}>Paid out to 14 success addresses</div>
            </Card>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.65rem' }}>
                <ArrowDownRight size={17} color={seriesColors.failed} />
                <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Redirected on Failure</span>
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: seriesColors.failed }}>$2,400 USDC</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.76rem', marginTop: '0.25rem' }}>Sent to 4 failure destinations</div>
            </Card>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.65rem' }}>
                <DollarSign size={17} color="var(--muted)" />
                <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Fee Summary</span>
              </div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800 }}>$124 USDC</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.76rem', marginTop: '0.25rem' }}>1% platform fee on all vaults</div>
            </Card>

          </div>
        </div>

        {/* ── SECTION 6: Benchmarking ── */}
        <div style={{ marginBottom: '2rem' }}>
          <SectionTitle>Benchmarking — You vs Platform Average</SectionTitle>
          <Card>
            <div className="bench-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              {benchmarkData.map((item, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--muted)' }}>{item.metric}</span>
                    <span style={{ color: item.you >= item.platform ? seriesColors.success : seriesColors.failed, fontWeight: 700 }}>
                      {item.you >= item.platform ? '↑' : '↓'} You: {item.you}{i === 0 || i === 2 ? (i === 0 ? '%' : '') : (i === 3 ? '' : 'd')}
                    </span>
                  </div>
                  {/* Your bar */}
                  <div style={{ marginBottom: '0.25rem' }}>
                    <div style={{ fontSize: '0.72rem', color: seriesColors.success, marginBottom: '0.15rem' }}>You</div>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 99 }}>
                      <div className="disciplr-progress-bar" style={{ height: '100%', width: `${Math.min((item.you / (Math.max(item.you, item.platform) * 1.2)) * 100, 100)}%`, background: seriesColors.success, borderRadius: 99 }} />
                    </div>
                  </div>
                  {/* Platform bar */}
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.15rem' }}>Platform avg</div>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 99 }}>
                      <div style={{ height: '100%', width: `${Math.min((item.platform / (Math.max(item.you, item.platform) * 1.2)) * 100, 100)}%`, background: 'var(--muted)', borderRadius: 99 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── SECTION 7: Goal Setting ── */}
        <div style={{ marginBottom: '1rem' }}>
          <SectionTitle>Goal Setting & Tracking</SectionTitle>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Flag size={17} color="var(--accent)" />
              <span style={{ fontWeight: 600 }}>Set your targets for this period</span>
            </div>
            <div className="bench-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>

              {/* Success Rate Goal */}
              <div>
                <label style={{ color: 'var(--muted)', fontSize: '0.82rem', display: 'block', marginBottom: '0.5rem' }}>
                  Target Success Rate (%)
                </label>
                <input type="number" value={goalRate} min={0} max={100}
                  onChange={e => setGoalRate(e.target.value)} />
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Current: 85%</span>
                    <span style={{ color: Number(goalRate) <= 85 ? seriesColors.success : seriesColors.comparison }}>
                      Goal: {goalRate}%
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, position: 'relative' }}>
                    <div className="disciplr-progress-bar" style={{ height: '100%', width: `${Math.min(85, 100)}%`, background: seriesColors.success, borderRadius: 99 }} />
                    <div style={{
                      position: 'absolute', top: -2, left: `${Math.min(Number(goalRate), 100)}%`,
                      width: 3, height: 12, background: seriesColors.comparison, borderRadius: 2,
                      transform: 'translateX(-50%)',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: Number(goalRate) <= 85 ? seriesColors.success : 'var(--muted)', marginTop: '0.3rem' }}>
                    {Number(goalRate) <= 85 ? '✓ Goal achieved!' : `${Number(goalRate) - 85}% to go`}
                  </div>
                </div>
              </div>

              {/* Capital Goal */}
              <div>
                <label style={{ color: 'var(--muted)', fontSize: '0.82rem', display: 'block', marginBottom: '0.5rem' }}>
                  Target Capital Locked (USDC)
                </label>
                <input type="number" value={goalCapital} min={0}
                  onChange={e => setGoalCapital(e.target.value)} />
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Current: $3,200</span>
                    <span style={{ color: Number(goalCapital) <= 3200 ? seriesColors.success : seriesColors.comparison }}>
                      Goal: ${Number(goalCapital).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, position: 'relative' }}>
                    <div className="disciplr-progress-bar" style={{ height: '100%', width: `${Math.min((3200 / Math.max(Number(goalCapital), 3200)) * 100, 100)}%`, background: seriesColors.success, borderRadius: 99 }} />
                    <div style={{
                      position: 'absolute', top: -2,
                      left: `${Math.min((Number(goalCapital) / Math.max(Number(goalCapital), 3200)) * 100, 100)}%`,
                      width: 3, height: 12, background: seriesColors.comparison, borderRadius: 2, transform: 'translateX(-50%)',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: Number(goalCapital) <= 3200 ? seriesColors.success : 'var(--muted)', marginTop: '0.3rem' }}>
                    {Number(goalCapital) <= 3200 ? '✓ Goal achieved!' : `$${(Number(goalCapital) - 3200).toLocaleString()} to go`}
                  </div>
                </div>
              </div>

              {/* Score tip */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Quick Insights</div>
                {[
                  { icon: <BarChart2 size={14} color={seriesColors.success} />, text: 'You outperform 85% of users' },
                  { icon: <Flame size={14} color={seriesColors.warning} />, text: 'Keep your 5-vault streak going' },
                  { icon: <CheckCircle size={14} color={seriesColors.success} />, text: 'Best month was June (92%)' },
                ].map((tip, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.6rem 0.85rem', background: 'var(--bg)',
                    borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.82rem',
                  }}>
                    {tip.icon} {tip.text}
                  </div>
                ))}
              </div>

            </div>
          </Card>
        </div>

        {/* ── SECTION 8: Team / Organization Analytics (Enterprise) ── */}
        <div style={{ marginBottom: '1rem' }}>
          <SectionTitle>
            <span>Team & Organization Analytics </span>
            <span style={{
              fontSize: '0.7rem',
              background: seriesColors.warning,
              color: 'var(--bg)',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              verticalAlign: 'middle',
            }}>ENTERPRISE</span>
          </SectionTitle>

          {/* Upgrade banner */}
          <div style={{
            background: chartTokens.accentTransparent,
            border: `1px solid ${seriesColors.warning}`,
            borderRadius: 'var(--radius)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}>
            <Crown size={22} color={seriesColors.warning} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                Unlock Team Analytics with Enterprise
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                Monitor your entire organization's accountability performance, compare members, and export team-wide reports.
              </div>
            </div>
            <button style={{
              background: seriesColors.warning,
              color: 'var(--bg)',
              border: 'none',
              padding: '0.55rem 1.25rem',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              flexShrink: 0,
            }}>
              Upgrade to Enterprise
            </button>
          </div>

          {/* Blurred preview */}
          <div className="bench-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', position: 'relative' }}>

            {/* Lock overlay */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              borderRadius: 'var(--radius)',
            }}>
              <div style={{ textAlign: 'center' }}>
                <Lock size={28} color={seriesColors.warning} style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Enterprise Feature</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Upgrade to view team data</div>
              </div>
            </div>

            {/* Team Members */}
            <Card style={{ opacity: 0.4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Users size={17} color="var(--muted)" />
                <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Team Members</span>
              </div>
              {[
                { name: 'Alice', score: 94, vaults: 8 },
                { name: 'Bob', score: 78, vaults: 5 },
                { name: 'Carol', score: 88, vaults: 6 },
              ].map((member, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.6rem 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', fontSize: '0.85rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                      {member.name[0]}
                    </div>
                    {member.name}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: seriesColors.success }}>{member.score}%</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{member.vaults} vaults</div>
                  </div>
                </div>
              ))}
            </Card>

            {/* Team Bar Chart */}
            <Card style={{ opacity: 0.4 }}>
              <ChartTitle>Team Success Rate</ChartTitle>
              <ChartSummary>
                Locked enterprise preview bar chart showing example team member success rates.
              </ChartSummary>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={[
                  { name: 'Alice', rate: 94 },
                  { name: 'Bob', rate: 78 },
                  { name: 'Carol', rate: 88 },
                  { name: 'Dave', rate: 65 },
                ]}>
                  <XAxis dataKey="name" stroke={seriesColors.axis} tick={{ fill: seriesColors.axis, fontSize: 11 }} />
                  <YAxis stroke={seriesColors.axis} tick={{ fill: seriesColors.axis, fontSize: 11 }} unit="%" />
                  <Bar dataKey="rate" fill={seriesColors.success} radius={[4, 4, 0, 0]} isAnimationActive={chartAnimationEnabled} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Org Summary */}
            <Card style={{ opacity: 0.4 }}>
              <ChartTitle>Organization Summary</ChartTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Total Members', value: '12' },
                  { label: 'Team Success Rate', value: '81%' },
                  { label: 'Total Capital Locked', value: '$48,200 USDC' },
                  { label: 'Active Vaults', value: '23' },
                  { label: 'Top Performer', value: 'Alice (94%)' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingBottom: '0.5rem', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ color: 'var(--muted)' }}>{item.label}</span>
                    <span style={{ fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>

      </div>
    </>
  )
}
