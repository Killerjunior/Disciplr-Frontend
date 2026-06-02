import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Text } from "../components/Text";

// ── Types ─────────────────────────────────────────────────────────────────────
type VaultStatus =
  | "active"
  | "completed"
  | "failed"
  | "cancelled"
  | "pending_validation";

type MilestoneStatus = "pending" | "validated" | "failed";

interface Milestone {
  id: string;
  title: string;
  description: string;
  criteria: string;
  status: MilestoneStatus;
  validatedAt?: string;
  evidenceUrl?: string;
}

interface VaultTransaction {
  id: string;
  type: "create" | "validate" | "release" | "redirect";
  hash: string;
  timestamp: string;
  amount?: number;
}

interface Vault {
  id: string;
  name: string;
  status: VaultStatus;
  amount: number;
  currency: string;
  createdAt: string;
  deadline: string;
  creatorAddress: string;
  verifierAddress?: string;
  successAddress: string;
  failureAddress: string;
  contractAddress: string;
  milestones: Milestone[];
  transactions: VaultTransaction[];
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_VAULTS: Record<string, Vault> = {
  "1": {
    id: "1",
    name: "Alpha Vault",
    status: "active",
    amount: 12500,
    currency: "USDC",
    createdAt: "2024-01-15T10:00:00Z",
    deadline: "2024-07-15T10:00:00Z",
    creatorAddress: "GBVZ3KQKM4XNQPBEZMXPOLKQKM4XNQPBEZMXPOLKQK7L",
    verifierAddress: "GVERIF3KQKM4XNQPBEZMXPOLKQKM4XNQPBEZMXPOLKQK",
    successAddress: "GSUCC3KQKM4XNQPBEZMXPOLKQKM4XNQPBEZMXPOLKQK",
    failureAddress: "GFAIL3KQKM4XNQPBEZMXPOLKQKM4XNQPBEZMXPOLKQK",
    contractAddress: "GCONT3KQKM4XNQPBEZMXPOLKQKM4XNQPBEZMXPOLKQK",
    milestones: [
      {
        id: "m1",
        title: "Phase 1 Complete",
        description: "Complete initial development phase",
        criteria: "All unit tests passing, code reviewed",
        status: "validated",
        validatedAt: "2024-02-20T14:30:00Z",
        evidenceUrl: "https://github.com/org/repo/pull/42",
      },
      {
        id: "m2",
        title: "Beta Launch",
        description: "Launch beta version to 100 users",
        criteria: "Beta deployed, 100 active users onboarded",
        status: "pending",
      },
    ],
    transactions: [
      {
        id: "tx1",
        type: "create",
        hash: "a3f9d1c8e2b74056af3d9c1b2e8f0a4d",
        timestamp: "2024-01-15T10:00:00Z",
        amount: 12500,
      },
      {
        id: "tx2",
        type: "validate",
        hash: "b4e0c2d9f3a85167bg4e0d2c3f9a5e8b",
        timestamp: "2024-02-20T14:30:00Z",
      },
    ],
  },
  "2": {
    id: "2",
    name: "Beta Reserve",
    status: "completed",
    amount: 4200.5,
    currency: "USDC",
    createdAt: "2023-10-01T09:00:00Z",
    deadline: "2024-01-01T09:00:00Z",
    creatorAddress: "GBVZ3KQKM4XNQPBEZMXPOLKQKM4XNQPBEZMXPOLKQK7L",
    successAddress: "GSUCC3KQKM4XNQPBEZMXPOLKQKM4XNQPBEZMXPOLKQK",
    failureAddress: "GFAIL3KQKM4XNQPBEZMXPOLKQKM4XNQPBEZMXPOLKQK",
    contractAddress: "GCONT4KQKM4XNQPBEZMXPOLKQKM4XNQPBEZMXPOLKQK",
    milestones: [
      {
        id: "m1",
        title: "Project Delivery",
        description: "Deliver final project",
        criteria: "All deliverables submitted and approved",
        status: "validated",
        validatedAt: "2023-12-28T11:00:00Z",
        evidenceUrl: "https://docs.example.com/delivery",
      },
    ],
    transactions: [
      {
        id: "tx1",
        type: "create",
        hash: "e7b3f5a2c6d18490ej7b3a5f6c2d8b1e",
        timestamp: "2023-10-01T09:00:00Z",
        amount: 4200.5,
      },
      {
        id: "tx2",
        type: "validate",
        hash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
        timestamp: "2023-12-28T11:00:00Z",
      },
      {
        id: "tx3",
        type: "release",
        hash: "c5f1d3e0a4b96278ch5f1e3d4a0b6f9c",
        timestamp: "2024-01-01T09:00:00Z",
        amount: 4200.5,
      },
    ],
  },
  "3": {
    id: "3",
    name: "Gamma Fund",
    status: "failed",
    amount: 8800,
    currency: "USDC",
    createdAt: "2023-08-01T08:00:00Z",
    deadline: "2023-12-01T08:00:00Z",
    creatorAddress: "GBVZ3KQKM4XNQPBEZMXPOLKQKM4XNQPBEZMXPOLKQK7L",
    failureAddress: "GFAIL3KQKM4XNQPBEZMXPOLKQKM4XNQPBEZMXPOLKQK",
    successAddress: "GSUCC3KQKM4XNQPBEZMXPOLKQKM4XNQPBEZMXPOLKQK",
    contractAddress: "GCONT5KQKM4XNQPBEZMXPOLKQKM4XNQPBEZMXPOLKQK",
    milestones: [
      {
        id: "m1",
        title: "Milestone 1",
        description: "First milestone",
        criteria: "Criteria not met",
        status: "failed",
      },
    ],
    transactions: [
      {
        id: "tx1",
        type: "create",
        hash: "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
        timestamp: "2023-08-01T08:00:00Z",
        amount: 8800,
      },
      {
        id: "tx2",
        type: "redirect",
        hash: "d6a2e4f1b5c07389di6a2f4e5b1c7a0d",
        timestamp: "2023-12-01T08:00:00Z",
        amount: 8800,
      },
    ],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  VaultStatus,
  { label: string; color: string; bg: string }
> = {
  active: {
    label: "Active",
    color: "var(--accent)",
    bg: "var(--accent-transparent)",
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
  pending_validation: {
    label: "Pending Validation",
    color: "var(--warning)",
    bg: "rgba(245,158,11,0.1)",
  },
};

const MILESTONE_CONFIG: Record<
  MilestoneStatus,
  { label: string; color: string }
> = {
  pending: { label: "Pending", color: "var(--muted)" },
  validated: { label: "Validated", color: "var(--success)" },
  failed: { label: "Failed", color: "var(--danger)" },
};

const TX_LABELS: Record<string, string> = {
  create: "Vault Created",
  validate: "Milestone Validated",
  release: "Funds Released",
  redirect: "Funds Redirected",
};

function truncAddr(addr: string): string {
  return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
}

function truncHash(hash: string): string {
  return hash.length > 12 ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : hash;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeRemaining(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
}

function timelineProgress(created: string, deadline: string): number {
  const start = new Date(created).getTime();
  const end = new Date(deadline).getTime();
  const now = Date.now();
  return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
}

// ── Copy Button ───────────────────────────────────────────────────────────────
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={copy}
      title="Copy"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: copied ? "var(--success)" : "var(--muted)",
        padding: "0 4px",
        fontSize: 13,
        lineHeight: 1,
      }}
    >
      {copied ? "✓" : "⎘"}
    </button>
  );
}

// ── Address Row ───────────────────────────────────────────────────────────────
function AddrRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <Text
        role="caption"
        as="span"
        style={{ color: "var(--muted)", minWidth: 140 }}
      >
        {label}
      </Text>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Text role="mono" as="span" style={{ color: "var(--text)" }}>
          {truncAddr(value)}
        </Text>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

// ── Section Card ─────────────────────────────────────────────────────────────
function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "1.25rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function VaultDetail() {
  const { id } = useParams<{ id: string }>();
  const vault = id ? MOCK_VAULTS[id] : undefined;

  if (!vault) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <Text role="title" as="h2" style={{ marginBottom: "0.5rem" }}>
          Vault not found
        </Text>
        <Text
          role="body"
          as="p"
          style={{ color: "var(--muted)", marginBottom: "1.5rem" }}
        >
          No vault with ID "{id}" exists.
        </Text>
        <Link to="/vaults" style={{ color: "var(--accent)" }}>
          ← Back to Vaults
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[vault.status];
  const progress = timelineProgress(vault.createdAt, vault.deadline);
  const isActive =
    vault.status === "active" || vault.status === "pending_validation";

  return (
    <div
      style={{
        maxWidth: "var(--container-detail)",
        margin: "0 auto",
        padding: "0 0 3rem",
      }}
    >
      {/* Back link */}
      <Link
        to="/vaults"
        style={{
          color: "var(--muted)",
          fontSize: 14,
          display: "inline-block",
          marginBottom: "1.25rem",
        }}
      >
        ← Back to Vaults
      </Link>

      {/* ── Header ── */}
      <Card style={{ marginBottom: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
                marginBottom: "0.5rem",
              }}
            >
              <Text role="title" as="h1" style={{ margin: 0 }}>
                {vault.name}
              </Text>
              <span
                style={{
                  background: statusCfg.bg,
                  color: statusCfg.color,
                  border: `var(--border-width-1) solid ${statusCfg.color}`,
                  borderRadius: "var(--radius-full)",
                  padding: "2px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {statusCfg.label}
              </span>
            </div>
            <Text
              role="display"
              as="div"
              style={{ color: "var(--accent)", lineHeight: 1.1 }}
            >
              {vault.amount.toLocaleString()}{" "}
              <span
                style={{
                  fontSize: "0.45em",
                  color: "var(--muted)",
                  fontWeight: 400,
                }}
              >
                {vault.currency}
              </span>
            </Text>
          </div>

          {/* Quick Actions */}
          {isActive && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {vault.status === "pending_validation" && (
                <button style={actionBtn("var(--accent)")}>
                  Validate Milestone
                </button>
              )}
              <button style={actionBtn("var(--warning)")}>
                Extend Deadline
              </button>
              <button style={actionBtn("var(--danger)")}>Cancel Vault</button>
            </div>
          )}
        </div>
      </Card>

      {/* ── Timeline ── */}
      <Card style={{ marginBottom: "1.25rem" }}>
        <Text
          role="caption"
          as="div"
          style={{
            color: "var(--muted)",
            marginBottom: "1rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Status Timeline
        </Text>
        <div style={{ position: "relative", marginBottom: "0.5rem" }}>
          {/* Track */}
          <div
            style={{ height: 6, background: "var(--border)", borderRadius: 3 }}
          />
          {/* Fill */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: 6,
              width: `${progress}%`,
              background: isActive ? "var(--accent)" : statusCfg.color,
              borderRadius: 3,
              transition: "width 0.4s",
            }}
          />
          {/* Marker */}
          {isActive && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: `${progress}%`,
                transform: "translate(-50%, -50%)",
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "var(--accent)",
                border: "2px solid var(--bg)",
                boxShadow: "0 0 0 2px var(--accent)",
              }}
            />
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "0.5rem",
          }}
        >
          <Text role="caption" as="span" style={{ color: "var(--muted)" }}>
            Created {fmtDate(vault.createdAt)}
          </Text>
          {isActive ? (
            <Text
              role="caption"
              as="span"
              style={{ color: "var(--accent)", fontWeight: 600 }}
            >
              {timeRemaining(vault.deadline)}
            </Text>
          ) : (
            <Text
              role="caption"
              as="span"
              style={{ color: statusCfg.color, fontWeight: 600 }}
            >
              {statusCfg.label}
            </Text>
          )}
          <Text role="caption" as="span" style={{ color: "var(--muted)" }}>
            Deadline {fmtDate(vault.deadline)}
          </Text>
        </div>
      </Card>

      {/* ── Info + Addresses ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.25rem",
          marginBottom: "1.25rem",
        }}
      >
        <Card>
          <Text
            role="caption"
            as="div"
            style={{
              color: "var(--muted)",
              marginBottom: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Vault Info
          </Text>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            <InfoRow label="Created" value={fmtDateTime(vault.createdAt)} />
            <InfoRow label="Deadline" value={fmtDateTime(vault.deadline)} />
            <InfoRow
              label="Duration"
              value={durationLabel(vault.createdAt, vault.deadline)}
            />
            <InfoRow
              label="Amount"
              value={`${vault.amount.toLocaleString()} ${vault.currency}`}
            />
          </div>
        </Card>

        <Card>
          <Text
            role="caption"
            as="div"
            style={{
              color: "var(--muted)",
              marginBottom: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Addresses
          </Text>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            <AddrRow label="Creator" value={vault.creatorAddress} />
            {vault.verifierAddress && (
              <AddrRow label="Verifier" value={vault.verifierAddress} />
            )}
            <AddrRow label="Success destination" value={vault.successAddress} />
            <AddrRow label="Failure destination" value={vault.failureAddress} />
            <AddrRow label="Contract" value={vault.contractAddress} />
          </div>
        </Card>
      </div>

      {/* ── Milestones ── */}
      <Card style={{ marginBottom: "1.25rem" }}>
        <Text
          role="caption"
          as="div"
          style={{
            color: "var(--muted)",
            marginBottom: "1rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Milestones
        </Text>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {vault.milestones.map((m, i) => {
            const mCfg = MILESTONE_CONFIG[m.status];
            return (
              <div
                key={m.id}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "1rem",
                  borderLeft: `3px solid ${mCfg.color}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: "0.4rem",
                  }}
                >
                  <Text role="body" as="span" style={{ fontWeight: 600 }}>
                    {i + 1}. {m.title}
                  </Text>
                  <span
                    style={{ color: mCfg.color, fontSize: 12, fontWeight: 600 }}
                  >
                    {mCfg.label}
                  </span>
                </div>
                <Text
                  role="caption"
                  as="p"
                  style={{ color: "var(--muted)", margin: "0 0 0.3rem" }}
                >
                  {m.description}
                </Text>
                <Text
                  role="caption"
                  as="p"
                  style={{ color: "var(--muted)", margin: "0 0 0.3rem" }}
                >
                  <strong>Criteria:</strong> {m.criteria}
                </Text>
                {m.validatedAt && (
                  <Text
                    role="caption"
                    as="p"
                    style={{ color: "var(--success)", margin: "0 0 0.3rem" }}
                  >
                    Validated {fmtDateTime(m.validatedAt)}
                  </Text>
                )}
                {m.evidenceUrl && (
                  <a
                    href={m.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: "var(--accent)" }}
                  >
                    View evidence ↗
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Transactions ── */}
      <Card>
        <Text
          role="caption"
          as="div"
          style={{
            color: "var(--muted)",
            marginBottom: "1rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Transaction History
        </Text>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {vault.transactions.map((tx) => (
            <div
              key={tx.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
                padding: "0.75rem",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
            >
              <div>
                <Text
                  role="caption"
                  as="div"
                  style={{ fontWeight: 600, marginBottom: 2 }}
                >
                  {TX_LABELS[tx.type]}
                </Text>
                <Text role="caption" as="div" style={{ color: "var(--muted)" }}>
                  {fmtDateTime(tx.timestamp)}
                </Text>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {tx.amount != null && (
                  <Text
                    role="caption"
                    as="span"
                    style={{ color: "var(--text)", fontWeight: 600 }}
                  >
                    {tx.amount.toLocaleString()} {vault.currency}
                  </Text>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Text
                    role="mono"
                    as="span"
                    style={{ color: "var(--muted)", fontSize: 11 }}
                  >
                    {truncHash(tx.hash)}
                  </Text>
                  <CopyButton value={tx.hash} />
                  <a
                    href={`https://stellar.expert/explorer/public/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--accent)", fontSize: 11 }}
                  >
                    ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <Text role="caption" as="span" style={{ color: "var(--muted)" }}>
        {label}
      </Text>
      <Text
        role="caption"
        as="span"
        style={{ color: "var(--text)", textAlign: "right" }}
      >
        {value}
      </Text>
    </div>
  );
}

function durationLabel(start: string, end: string): string {
  const days = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 86400000,
  );
  if (days >= 365) return `${Math.round(days / 365)}y`;
  if (days >= 30) return `${Math.round(days / 30)}mo`;
  return `${days}d`;
}

function actionBtn(color: string): React.CSSProperties {
  return {
    background: "transparent",
    border: `1px solid ${color}`,
    color,
    borderRadius: "var(--radius)",
    padding: "0.4rem 0.9rem",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    minHeight: 36,
  };
}
