import { Link } from "react-router-dom";
import { Text } from "../components/Text";
import VaultCard from "../components/VaultCard";
import UpcomingDeadlines from "../components/UpcomingDeadlines";

// ── Types ─────────────────────────────────────────────────────────────────────
import { useMemo } from "react";
import * as dashboardUtils from "../utils/dashboard";
import type { VaultPreview, Activity, Deadline } from "../utils/dashboard";
import type { VaultStatus } from "../types/vault";

// ── Mock Data ─────────────────────────────────────────────────────────────────
const SUMMARY = {
  totalLocked: 25500,
  activeVaults: 3,
  pendingMilestones: 2,
  completionRate: 67,
};

const VAULTS: VaultPreview[] = [
  {
    id: "1",
    name: "Alpha Vault",
    amount: 12500,
    currency: "USDC",
    status: "active",
    progressPct: 42,
    deadline: "2024-07-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Beta Reserve",
    amount: 8800,
    currency: "USDC",
    status: "pending_validation",
    progressPct: 78,
    deadline: "2024-05-20T10:00:00Z",
  },
  {
    id: "3",
    name: "Gamma Fund",
    amount: 4200,
    currency: "USDC",
    status: "active",
    progressPct: 25,
    deadline: "2024-09-01T10:00:00Z",
  },
];

const ACTIVITY: Activity[] = [
  {
    id: "a1",
    type: "validated",
    vault: "Alpha Vault",
    timestamp: "2024-04-28T14:30:00Z",
  },
  {
    id: "a2",
    type: "created",
    vault: "Gamma Fund",
    timestamp: "2024-04-27T09:00:00Z",
    amount: 4200,
  },
  {
    id: "a3",
    type: "released",
    vault: "Delta Safe",
    timestamp: "2024-04-25T16:45:00Z",
    amount: 15000,
  },
  {
    id: "a4",
    type: "redirected",
    vault: "Epsilon Pool",
    timestamp: "2024-04-24T11:20:00Z",
    amount: 3300,
  },
];

const DEADLINES: Deadline[] = [
  {
    id: "2",
    name: "Beta Reserve",
    deadline: "2024-05-20T10:00:00Z",
    amount: 8800,
  },
  {
    id: "1",
    name: "Alpha Vault",
    deadline: "2024-07-15T10:00:00Z",
    amount: 12500,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<
  VaultStatus,
  { label: string; color: string; bg: string }
> = {
  active: {
    label: "Active",
    color: "var(--accent)",
    bg: "var(--accent-transparent)",
  },
  pending_validation: {
    label: "Pending Validation",
    color: "var(--warning)",
    bg: "rgba(245,158,11,0.1)",
  },
  completed: {
    label: "Completed",
    color: "var(--success)",
    bg: "rgba(16,185,129,0.1)",
  },
  failed: {
    label: "Failed",
    color: "var(--danger)",
    bg: "rgba(239,68,68,0.1)",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--muted)",
    bg: "rgba(156,163,175,0.1)",
  },
};

const ACTIVITY_CFG: Record<
  Activity["type"],
  { label: string; icon: string; color: string }
> = {
  created: { label: "Vault created", icon: "＋", color: "var(--accent)" },
  validated: {
    label: "Milestone validated",
    icon: "✓",
    color: "var(--success)",
  },
  released: {
    label: "Funds released",
    icon: "↑",
    color: "var(--info, #60A5FA)",
  },
  redirected: { label: "Funds redirected", icon: "→", color: "var(--warning)" },
};

// Pure formatting functions have been extracted to src/utils/dashboard.ts

// ── Sub-components ────────────────────────────────────────────────────────────
function SummaryCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <Text
        role="caption"
        as="div"
        style={{
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </Text>
      <Text
        role="title"
        as="div"
        style={{
          color: accent ? "var(--accent)" : "var(--text)",
          fontWeight: 700,
        }}
      >
        {value}
      </Text>
      {sub && (
        <Text role="caption" as="div" style={{ color: "var(--muted)" }}>
          {sub}
        </Text>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: VaultStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `var(--border-width-1) solid ${cfg.color}`,
        borderRadius: "var(--radius-full)",
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

function SectionHeader({
  title,
  action,
  to,
}: {
  title: string;
  action?: string;
  to?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "0.75rem",
      }}
    >
      <Text role="body" as="h2" style={{ margin: 0, fontWeight: 600 }}>
        {title}
      </Text>
      {action && to && (
        <Link to={to} style={{ color: "var(--accent)", fontSize: 13 }}>
          {action}
        </Link>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard({
  summary = SUMMARY,
  vaults = VAULTS,
  activity = ACTIVITY,
  deadlines = DEADLINES,
}: {
  summary?: typeof SUMMARY;
  vaults?: VaultPreview[];
  activity?: Activity[];
  deadlines?: Deadline[];
} = {}) {
  const hasVaults = vaults.length > 0;

  const memoizedSummary = useMemo(
    () => dashboardUtils.formatSummary(summary),
    [summary],
  );
  const memoizedActivity = useMemo(
    () => dashboardUtils.processActivity(activity),
    [activity],
  );

  return (
    <div
      style={{
        maxWidth: "var(--container-wide)",
        margin: "0 auto",
        padding: "0 0 3rem",
      }}
    >
      {/* Welcome */}
      <div style={{ marginBottom: "1.75rem" }}>
        <Text role="title" as="h1" style={{ margin: "0 0 0.25rem" }}>
          Dashboard
        </Text>
        <Text role="body" as="p" style={{ color: "var(--muted)", margin: 0 }}>
          Your vault overview at a glance.
        </Text>
      </div>

      {/* ── Summary Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        <SummaryCard
          label="Total Locked"
          value={memoizedSummary.totalLocked}
          sub="USDC"
          accent
        />
        <SummaryCard
          label="Active Vaults"
          value={memoizedSummary.activeVaults}
        />
        <SummaryCard
          label="Pending Milestones"
          value={memoizedSummary.pendingMilestones}
        />
        <SummaryCard
          label="Completion Rate"
          value={memoizedSummary.completionRate}
          sub="all time"
        />
      </div>

      {/* ── Quick Actions ── */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          marginBottom: "1.75rem",
        }}
      >
        <Link
          to="/vaults/create"
          style={{
            background: "var(--accent)",
            color: "var(--bg)",
            padding: "0.6rem 1.25rem",
            borderRadius: "var(--radius)",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          + Create Vault
        </Link>
        <Link
          to="/vaults"
          style={{
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            padding: "0.6rem 1.25rem",
            borderRadius: "var(--radius)",
            fontWeight: 500,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          View All Vaults
        </Link>
        <button
          style={{
            background: "var(--surface)",
            color: "var(--warning)",
            border: "1px solid var(--warning)",
            padding: "0.6rem 1.25rem",
            borderRadius: "var(--radius)",
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Verify Milestone
        </button>
      </div>

      {/* ── Main grid: vault list + sidebar ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,340px)",
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* Vault Preview List */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "1.25rem",
            }}
          >
            <SectionHeader
              title="Active Vaults"
              action="View all →"
              to="/vaults"
            />
            {hasVaults ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {vaults.map((v) => (
                  <VaultCard
                    key={v.id}
                    id={v.id}
                    name={v.name}
                    amount={v.amount}
                    currency={v.currency}
                    status={v.status}
                    deadline={v.deadline}
                    progressPct={v.progressPct}
                  />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div
                style={{
                  textAlign: "center",
                  padding: "2.5rem 1rem",
                  color: "var(--muted)",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: "0.75rem" }}>🔒</div>
                <Text
                  role="body"
                  as="div"
                  style={{ fontWeight: 600, marginBottom: 4 }}
                >
                  No vaults yet
                </Text>
                <Text role="caption" as="div" style={{ marginBottom: "1rem" }}>
                  Create your first vault to start locking capital.
                </Text>
                <Link
                  to="/vaults/create"
                  style={{
                    background: "var(--accent)",
                    color: "var(--bg)",
                    padding: "0.5rem 1.25rem",
                    borderRadius: "var(--radius)",
                    fontWeight: 600,
                    fontSize: 13,
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Create Vault
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "1.25rem",
            }}
          >
            <SectionHeader title="Recent Activity" />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {memoizedActivity.map((a) => {
                const cfg = ACTIVITY_CFG[a.type];
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.5rem 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: "var(--bg)",
                        border: `1px solid var(--border)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: cfg.color,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {cfg.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text role="caption" as="div" style={{ fontWeight: 600 }}>
                        {cfg.label} ·{" "}
                        <span
                          style={{ color: "var(--muted)", fontWeight: 400 }}
                        >
                          {a.vault}
                        </span>
                      </Text>
                      {a.formattedAmount != null && (
                        <Text
                          role="caption"
                          as="div"
                          style={{ color: "var(--muted)" }}
                        >
                          {a.formattedAmount}
                        </Text>
                      )}
                    </div>
                    <Text
                      role="caption"
                      as="span"
                      style={{ color: "var(--muted)", whiteSpace: "nowrap" }}
                    >
                      {a.relativeTime}
                    </Text>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <UpcomingDeadlines deadlines={deadlines} />

          {/* Success Rate Chart (sparkline bars) */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "1.25rem",
            }}
          >
            <SectionHeader title="Success Rate" />
            <Text
              role="caption"
              as="div"
              style={{ color: "var(--muted)", marginBottom: "0.75rem" }}
            >
              Last 6 months
            </Text>
            <SuccessChart />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Success Rate Sparkline ────────────────────────────────────────────────────
const CHART_DATA = [
  { month: "Nov", rate: 50 },
  { month: "Dec", rate: 60 },
  { month: "Jan", rate: 55 },
  { month: "Feb", rate: 75 },
  { month: "Mar", rate: 70 },
  { month: "Apr", rate: 67 },
];

function SuccessChart() {
  return (
    <div
      style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 64 }}
    >
      {CHART_DATA.map((d) => (
        <div
          key={d.month}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              width: "100%",
              height: `${d.rate * 0.64}px`,
              background: "var(--accent-transparent)",
              border: "1px solid var(--accent)",
              borderRadius: 3,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: `${d.rate}%`,
                background: "var(--accent)",
                borderRadius: 2,
                opacity: 0.7,
              }}
            />
          </div>
          <Text
            role="caption"
            as="span"
            style={{ color: "var(--muted)", fontSize: 10 }}
          >
            {d.month}
          </Text>
        </div>
      ))}
    </div>
  );
}
