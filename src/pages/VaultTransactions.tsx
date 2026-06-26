import { useState, useMemo, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type TxType = "create" | "validate" | "release" | "redirect";
type TxStatus = "confirmed" | "pending" | "failed";

interface Transaction {
  id: string;
  type: TxType;
  vault: string;
  amount: number;
  fee: number;
  block: number;
  hash: string;
  status: TxStatus;
  from: string;
  to: string;
  timestamp: Date;
  memo: string;
}

interface TypeMeta {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.FC<IconProps>;
}

interface StatusMeta {
  label: string;
  color: string;
  bg: string;
  dot: string;
}

interface IconProps {
  color?: string;
  size?: number;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx1",
    type: "create",
    vault: "Alpha Vault",
    amount: 12500.0,
    fee: 0.00012,
    block: 48201933,
    hash: "a3f9d1c8e2b74056af3d9c1b2e8f0a4d7c5e9b3f1a2d4c6e8b0f2a4c6d8e0f2a",
    status: "confirmed",
    from: "GBVZ3...QK7L",
    to: "GCVAULT...M3P",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    memo: "Initial deposit",
  },
  {
    id: "tx2",
    type: "validate",
    vault: "Alpha Vault",
    amount: 0,
    fee: 0.00008,
    block: 48202011,
    hash: "b4e0c2d9f3a85167bg4e0d2c3f9a5e8b4c6d0e2f4a6c8e0b2d4f6a8c0e2d4f6a",
    status: "confirmed",
    from: "GBVZ3...QK7L",
    to: "GCVAULT...M3P",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
    memo: "",
  },
  {
    id: "tx3",
    type: "release",
    vault: "Beta Reserve",
    amount: 4200.5,
    fee: 0.00015,
    block: 48202450,
    hash: "c5f1d3e0a4b96278ch5f1e3d4a0b6f9c5d7e1f3b5d7f9b1d3f5b7d9f1b3d5f7b",
    status: "confirmed",
    from: "GCVAULT...M3P",
    to: "GBVZ3...QK7L",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    memo: "Milestone payout",
  },
  {
    id: "tx4",
    type: "redirect",
    vault: "Gamma Fund",
    amount: 8800.0,
    fee: 0.00011,
    block: 48202891,
    hash: "d6a2e4f1b5c07389di6a2f4e5b1c7a0d6e8f2a4c6e8a0c2e4f6a8c0e2f4a6c8e",
    status: "pending",
    from: "GCVAULT...M3P",
    to: "GDELTA...X9K",
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    memo: "Redirect to escrow",
  },
  {
    id: "tx5",
    type: "create",
    vault: "Beta Reserve",
    amount: 31000.0,
    fee: 0.00013,
    block: 48201100,
    hash: "e7b3f5a2c6d18490ej7b3a5f6c2d8b1e7f9a3b5d7f9b1d3f5b7d9f1b3d5f7b9d",
    status: "confirmed",
    from: "GBVZ3...QK7L",
    to: "GCVAULT...M3P",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    memo: "New vault",
  },
  {
    id: "tx6",
    type: "release",
    vault: "Alpha Vault",
    amount: 500.0,
    fee: 0.00009,
    block: 48203100,
    hash: "f8c4a6b3d7e29501fk8c4b6a7d3e9c2f8a0c4b6d8f0b2d4f6a8b0d2f4a6b8d0f",
    status: "failed",
    from: "GCVAULT...M3P",
    to: "GBVZ3...QK7L",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    memo: "Partial release",
  },
  {
    id: "tx7",
    type: "validate",
    vault: "Gamma Fund",
    amount: 0,
    fee: 0.00007,
    block: 48201788,
    hash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    status: "confirmed",
    from: "GBVZ3...QK7L",
    to: "GCVAULT...M3P",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5),
    memo: "",
  },
  {
    id: "tx8",
    type: "redirect",
    vault: "Alpha Vault",
    amount: 1200.75,
    fee: 0.0001,
    block: 48203222,
    hash: "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
    status: "pending",
    from: "GCVAULT...M3P",
    to: "GBVZ3...QK7L",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    memo: "Reallocation",
  },
  {
    id: "tx9",
    type: "create",
    vault: "Delta Safe",
    amount: 99000.0,
    fee: 0.0002,
    block: 48200500,
    hash: "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4",
    status: "confirmed",
    from: "GBVZ3...QK7L",
    to: "GCVAULT...M3P",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    memo: "Large vault",
  },
  {
    id: "tx10",
    type: "release",
    vault: "Delta Safe",
    amount: 15000.0,
    fee: 0.00016,
    block: 48203400,
    hash: "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
    status: "confirmed",
    from: "GCVAULT...M3P",
    to: "GBVZ3...QK7L",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    memo: "Q3 release",
  },
];

const TYPE_META: Record<TxType, TypeMeta> = {
  create: {
    label: "Create",
    color: "#6ee7b7",
    bg: "rgba(110,231,183,0.1)",
    border: "rgba(110,231,183,0.25)",
    icon: CreateIcon,
  },
  validate: {
    label: "Validate",
    color: "#93c5fd",
    bg: "rgba(147,197,253,0.1)",
    border: "rgba(147,197,253,0.25)",
    icon: ValidateIcon,
  },
  release: {
    label: "Release",
    color: "#fcd34d",
    bg: "rgba(252,211,77,0.1)",
    border: "rgba(252,211,77,0.25)",
    icon: ReleaseIcon,
  },
  redirect: {
    label: "Redirect",
    color: "#f9a8d4",
    bg: "rgba(249,168,212,0.1)",
    border: "rgba(249,168,212,0.25)",
    icon: RedirectIcon,
  },
};

const STATUS_META: Record<TxStatus, StatusMeta> = {
  confirmed: {
    label: "Confirmed",
    color: "#6ee7b7",
    bg: "rgba(110,231,183,0.08)",
    dot: "#6ee7b7",
  },
  pending: {
    label: "Pending",
    color: "#fcd34d",
    bg: "rgba(252,211,77,0.08)",
    dot: "#fcd34d",
  },
  failed: {
    label: "Failed",
    color: "#fca5a5",
    bg: "rgba(252,165,165,0.08)",
    dot: "#fca5a5",
  },
};

const VAULTS = [
  "All Vaults",
  ...Array.from(new Set(MOCK_TRANSACTIONS.map((t) => t.vault))),
];
const TYPES: string[] = [
  "All Types",
  "create",
  "validate",
  "release",
  "redirect",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function truncHash(hash: string, head = 8, tail = 6): string {
  if (!hash) return "";
  return `${hash.slice(0, head)}...${hash.slice(-tail)}`;
}

function fmtTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtFullTime(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function fmtAmount(n: number): string {
  if (n === 0) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function exportCSV(txs: Transaction[]): void {
  const headers = [
    "ID",
    "Type",
    "Vault",
    "Amount (XLM)",
    "Fee (XLM)",
    "Status",
    "Timestamp",
    "Hash",
    "Block",
    "From",
    "To",
    "Memo",
  ];
  const rows = txs.map((t) => [
    t.id,
    t.type,
    t.vault,
    t.amount,
    t.fee,
    t.status,
    t.timestamp.toISOString(),
    t.hash,
    t.block,
    t.from,
    t.to,
    t.memo,
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vault-transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function VaultTransactions() {
  const [filterType, setFilterType] = useState<string>("All Types");
  const [filterVault, setFilterVault] = useState<string>("All Vaults");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchHash, setSearchHash] = useState<string>("");
  const [amountMin, setAmountMin] = useState<string>("");
  const [amountMax, setAmountMax] = useState<string>("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const copy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  }, []);

  const filtered = useMemo<Transaction[]>(() => {
    let list = [...MOCK_TRANSACTIONS];
    if (filterType !== "All Types")
      list = list.filter((t) => t.type === filterType);
    if (filterVault !== "All Vaults")
      list = list.filter((t) => t.vault === filterVault);
    if (filterStatus !== "all")
      list = list.filter((t) => t.status === filterStatus);
    if (searchHash.trim())
      list = list.filter((t) =>
        t.hash.toLowerCase().includes(searchHash.toLowerCase()),
      );
    if (amountMin !== "")
      list = list.filter((t) => t.amount >= parseFloat(amountMin));
    if (amountMax !== "")
      list = list.filter((t) => t.amount <= parseFloat(amountMax));
    list.sort((a, b) =>
      sortDir === "desc"
        ? b.timestamp.getTime() - a.timestamp.getTime()
        : a.timestamp.getTime() - b.timestamp.getTime(),
    );
    return list;
  }, [
    filterType,
    filterVault,
    filterStatus,
    searchHash,
    amountMin,
    amountMax,
    sortDir,
  ]);

  const pending = filtered.filter((t) => t.status === "pending");
  const failed = filtered.filter((t) => t.status === "failed");
  const rest = filtered.filter((t) => t.status === "confirmed");

  const stats = useMemo(
    () => ({
      total: MOCK_TRANSACTIONS.length,
      fees: MOCK_TRANSACTIONS.reduce((s, t) => s + t.fee, 0),
      capital: MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0),
    }),
    [],
  );

  const clearFilters = () => {
    setFilterType("All Types");
    setFilterVault("All Vaults");
    setFilterStatus("all");
    setSearchHash("");
    setAmountMin("");
    setAmountMax("");
  };

  const hasFilters =
    filterType !== "All Types" ||
    filterVault !== "All Vaults" ||
    filterStatus !== "all" ||
    !!searchHash ||
    !!amountMin ||
    !!amountMax;

  return (
    <>
      <style>{CSS}</style>
      <div className="vt-root">
        <div className="vt-grid-bg" />
        <div className="vt-wrap">
          {/* Header */}
          <header className="vt-header">
            <div>
              <div className="vt-eyebrow">
                <span className="vt-eyebrow-dot" />
                Vault Activity
              </div>
              <h1 className="vt-title">Transaction History</h1>
              <p className="vt-subtitle">
                Complete on-chain record of all vault operations
              </p>
            </div>
            <button
              className="vt-export-btn"
              onClick={() => exportCSV(filtered)}
            >
              <ExportIcon />
              Export CSV
            </button>
          </header>

          {/* Stats */}
          <div className="vt-stats">
            {[
              {
                label: "Total Transactions",
                value: stats.total,
                sub: `${filtered.length} matching`,
              },
              {
                label: "Total Fees Paid",
                value: `${stats.fees.toFixed(5)} XLM`,
                sub: "Network costs",
              },
              {
                label: "Capital Moved",
                value: `${fmtAmount(stats.capital)} XLM`,
                sub: "Across all vaults",
              },
            ].map((s, i) => (
              <div className="vt-stat-card" key={i}>
                <div className="vt-stat-label">{s.label}</div>
                <div className="vt-stat-value">{s.value}</div>
                <div className="vt-stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="vt-filters">
            <div className="vt-search-wrap">
              <SearchIcon className="vt-search-icon" />
              <input
                className="vt-search"
                placeholder="Search by transaction hash…"
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value)}
              />
            </div>
            <div className="vt-filter-row">
              <Select
                value={filterType}
                onChange={setFilterType}
                options={TYPES}
              />
              <Select
                value={filterVault}
                onChange={setFilterVault}
                options={VAULTS}
              />
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "confirmed", label: "Confirmed" },
                  { value: "pending", label: "Pending" },
                  { value: "failed", label: "Failed" },
                ]}
              />
              <div className="vt-amount-range">
                <input
                  className="vt-amount-input"
                  placeholder="Min XLM"
                  value={amountMin}
                  onChange={(e) => setAmountMin(e.target.value)}
                  type="number"
                />
                <span className="vt-amount-sep">–</span>
                <input
                  className="vt-amount-input"
                  placeholder="Max XLM"
                  value={amountMax}
                  onChange={(e) => setAmountMax(e.target.value)}
                  type="number"
                />
              </div>
              <button
                className="vt-sort-btn"
                onClick={() =>
                  setSortDir((d) => (d === "desc" ? "asc" : "desc"))
                }
              >
                <SortIcon dir={sortDir} />
                {sortDir === "desc" ? "Newest" : "Oldest"}
              </button>
              {hasFilters && (
                <button className="vt-clear-btn" onClick={clearFilters}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Pending */}
          {pending.length > 0 && (
            <Section title="Pending" accent="#fcd34d" count={pending.length}>
              {pending.map((tx) => (
                <TxRow
                  key={tx.id}
                  tx={tx}
                  onSelect={setSelectedTx}
                  onCopy={copy}
                  copiedId={copiedId}
                />
              ))}
            </Section>
          )}

          {/* Failed */}
          {failed.length > 0 && (
            <Section title="Failed" accent="#fca5a5" count={failed.length}>
              {failed.map((tx) => (
                <TxRow
                  key={tx.id}
                  tx={tx}
                  onSelect={setSelectedTx}
                  onCopy={copy}
                  copiedId={copiedId}
                >
                  <button className="vt-retry-btn">Retry →</button>
                </TxRow>
              ))}
            </Section>
          )}

          {/* Confirmed */}
          <Section title="Confirmed" accent="#6ee7b7" count={rest.length}>
            {rest.length === 0 ? (
              <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
            ) : (
              rest.map((tx) => (
                <TxRow
                  key={tx.id}
                  tx={tx}
                  onSelect={setSelectedTx}
                  onCopy={copy}
                  copiedId={copiedId}
                />
              ))
            )}
          </Section>
        </div>

        {selectedTx && (
          <TxModal
            tx={selectedTx}
            onClose={() => setSelectedTx(null)}
            onCopy={copy}
            copiedId={copiedId}
          />
        )}
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
interface SectionProps {
  title: string;
  accent: string;
  count: number;
  children: React.ReactNode;
}

function Section({ title, accent, count, children }: SectionProps) {
  const hasRows = count > 0;
  return (
    <section className="vt-section">
      <div className="vt-section-header">
        <span className="vt-section-dot" style={{ background: accent }} aria-hidden="true" />
        <span className="vt-section-title">{title}</span>
        <span className="vt-section-count">{count}</span>
      </div>
      <div
        className="vt-tx-list"
        role={hasRows ? "table" : undefined}
        aria-label={hasRows ? `${title} transactions` : undefined}
      >
        {hasRows && (
          <div role="rowgroup">
            <div role="row" className="vt-sr-only">
              <span role="columnheader">Transaction Type</span>
              <span role="columnheader">Vault &amp; Details</span>
              <span role="columnheader">Amount</span>
              <span role="columnheader">Status</span>
            </div>
          </div>
        )}
        <div role={hasRows ? "rowgroup" : undefined}>
          {children}
        </div>
      </div>
    </section>
  );
}

interface TxRowProps {
  tx: Transaction;
  onSelect: (tx: Transaction) => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  children?: React.ReactNode;
}

function TxRow({ tx, onSelect, onCopy, copiedId, children }: TxRowProps) {
  const meta = TYPE_META[tx.type];
  const status = STATUS_META[tx.status];
  const Icon = meta.icon;

  return (
    <div className="vt-tx-row" role="row" onClick={() => onSelect(tx)}>
      <div
        role="cell"
        className="vt-tx-icon"
        style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
      >
        <Icon color={meta.color} />
      </div>

      <div role="cell" className="vt-tx-main">
        <div className="vt-tx-top">
          <span className="vt-tx-type" style={{ color: meta.color }}>
            {meta.label}
          </span>
          <span className="vt-tx-vault">{tx.vault}</span>
          {tx.memo && <span className="vt-tx-memo">"{tx.memo}"</span>}
        </div>
        <div className="vt-tx-bottom">
          <button
            className="vt-tx-hash"
            onClick={(e) => {
              e.stopPropagation();
              onCopy(tx.hash, tx.id + "-hash");
            }}
            title="Copy hash"
          >
            {copiedId === tx.id + "-hash" ? "Copied!" : truncHash(tx.hash)}
            <CopyIcon small />
          </button>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="vt-tx-explorer"
            onClick={(e) => e.stopPropagation()}
          >
            Explorer ↗
          </a>
        </div>
      </div>

      <div role="cell" className="vt-tx-amount">
        {tx.amount > 0 && (
          <span className="vt-tx-amount-val">
            {fmtAmount(tx.amount)}
            <span className="vt-tx-xlm">XLM</span>
          </span>
        )}
        <span className="vt-tx-fee">Fee: {tx.fee.toFixed(5)}</span>
      </div>

      <div role="cell" className="vt-tx-right">
        <span
          className="vt-tx-status"
          style={{ color: status.color, background: status.bg }}
        >
          <span className="vt-status-dot" style={{ background: status.dot }} aria-hidden="true" />
          {status.label}
        </span>
        <span className="vt-tx-time">{fmtTime(tx.timestamp)}</span>
      </div>

      {children && <div role="cell">{children}</div>}
    </div>
  );
}

interface TxModalProps {
  tx: Transaction;
  onClose: () => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}

function TxModal({ tx, onClose, onCopy, copiedId }: TxModalProps) {
  const [rawOpen, setRawOpen] = useState(false);
  const meta = TYPE_META[tx.type];
  const status = STATUS_META[tx.status];
  const Icon = meta.icon;

  const raw = JSON.stringify(
    {
      id: tx.id,
      type: tx.type,
      vault: tx.vault,
      amount: tx.amount,
      fee: tx.fee,
      block: tx.block,
      hash: tx.hash,
      status: tx.status,
      from: tx.from,
      to: tx.to,
      memo: tx.memo,
      timestamp: tx.timestamp.toISOString(),
    },
    null,
    2,
  );

  return (
    <div className="vt-modal-backdrop" onClick={onClose}>
      <div className="vt-modal" onClick={(e) => e.stopPropagation()}>
        <button className="vt-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="vt-modal-header">
          <div
            className="vt-modal-icon"
            style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
          >
            <Icon color={meta.color} size={22} />
          </div>
          <div>
            <div className="vt-modal-type" style={{ color: meta.color }}>
              {meta.label} Transaction
            </div>
            <div className="vt-modal-vault">{tx.vault}</div>
          </div>
          <span
            className="vt-tx-status"
            style={{
              color: status.color,
              background: status.bg,
              marginLeft: "auto",
            }}
          >
            <span
              className="vt-status-dot"
              style={{ background: status.dot }}
            />
            {status.label}
          </span>
        </div>

        <div className="vt-modal-grid">
          <Field label="Full Hash">
            <div className="vt-modal-hash-row">
              <span className="vt-modal-hash">{tx.hash}</span>
              <button
                className="vt-copy-btn"
                onClick={() => onCopy(tx.hash, "modal-hash")}
              >
                {copiedId === "modal-hash" ? "✓" : <CopyIcon />}
              </button>
            </div>
          </Field>
          <Field label="From">
            <span className="vt-mono">{tx.from}</span>
          </Field>
          <Field label="To">
            <span className="vt-mono">{tx.to}</span>
          </Field>
          <div className="vt-modal-row2">
            <Field label="Amount">
              <span className="vt-modal-amount">
                {fmtAmount(tx.amount)}{" "}
                <span style={{ opacity: 0.5, fontSize: "0.85em" }}>XLM</span>
              </span>
            </Field>
            <Field label="Fee Paid">
              <span className="vt-modal-amount">
                {tx.fee.toFixed(5)}{" "}
                <span style={{ opacity: 0.5, fontSize: "0.85em" }}>XLM</span>
              </span>
            </Field>
            <Field label="Block">
              <span className="vt-mono">{tx.block.toLocaleString()}</span>
            </Field>
          </div>
          <Field label="Timestamp">
            <span className="vt-mono">{fmtFullTime(tx.timestamp)}</span>
          </Field>
          {tx.memo && (
            <Field label="Memo">
              <span>{tx.memo}</span>
            </Field>
          )}
        </div>

        <div className="vt-raw-section">
          <button
            className="vt-raw-toggle"
            onClick={() => setRawOpen((o) => !o)}
          >
            {rawOpen ? "▾" : "▸"} Raw Transaction Data
          </button>
          {rawOpen && <pre className="vt-raw-pre">{raw}</pre>}
        </div>

        <div className="vt-modal-footer">
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="vt-explorer-link"
          >
            View on Stellar Explorer ↗
          </a>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="vt-field">
      <div className="vt-field-label">{label}</div>
      <div className="vt-field-value">{children}</div>
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[] | SelectOption[];
}

function Select({ value, onChange, options }: SelectProps) {
  const opts: SelectOption[] = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
  return (
    <div className="vt-select-wrap">
      <select
        className="vt-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronIcon />
    </div>
  );
}

interface EmptyStateProps {
  hasFilters: boolean;
  onClear: () => void;
}

function EmptyState({ hasFilters, onClear }: EmptyStateProps) {
  return (
    <div className="vt-empty">
      <div className="vt-empty-icon">◎</div>
      <div className="vt-empty-title">
        {hasFilters ? "No matching transactions" : "No transactions yet"}
      </div>
      <div className="vt-empty-sub">
        {hasFilters
          ? "Try adjusting your filters."
          : "Vault activity will appear here."}
      </div>
      {hasFilters && (
        <button className="vt-clear-btn vt-clear-btn--lg" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function CreateIcon({ color = "currentColor", size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M8 2v12M2 8h12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function ValidateIcon({ color = "currentColor", size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8l3.5 3.5L13 4.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ReleaseIcon({ color = "currentColor", size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M8 3v7m-3-3l3 3 3-3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 13h10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function RedirectIcon({ color = "currentColor", size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8h10m-4-4l4 4-4 4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface CopyIconProps {
  small?: boolean;
}
function CopyIcon({ small }: CopyIconProps) {
  const s = small ? 11 : 14;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 16 16"
      fill="none"
      style={{ display: "inline", marginLeft: small ? 3 : 0, opacity: 0.6 }}
    >
      <rect
        x="5"
        y="5"
        width="9"
        height="9"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3 11V3a1 1 0 011-1h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.5 10.5L14 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function ExportIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      style={{ marginRight: 6 }}
    >
      <path
        d="M8 2v8m-3-3l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 13h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      style={{
        position: "absolute",
        right: 10,
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
        opacity: 0.5,
      }}
    >
      <path
        d="M2 3.5l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SortIcon({ dir }: { dir: "asc" | "desc" }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      style={{ marginRight: 5 }}
    >
      <path
        d={dir === "desc" ? "M2 3h8M3 6h6M4 9h4" : "M4 3h4M3 6h6M2 9h8"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  .vt-root {
    min-height: 100vh;
    background: #080b12;
    color: #e2e8f0;
    font-family: 'Syne', sans-serif;
    position: relative;
    overflow-x: hidden;
  }
  .vt-grid-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(110,231,183,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(110,231,183,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .vt-wrap {
    position: relative; z-index: 1;
    max-width: var(--container-wide); margin: 0 auto;
    padding: 48px 24px 80px;
  }
  .vt-header {
    display: flex; align-items: flex-end; justify-content: space-between;
    margin-bottom: 40px; gap: 16px; flex-wrap: wrap;
  }
  .vt-eyebrow {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
    color: #6ee7b7; margin-bottom: 10px; font-weight: 600;
  }
  .vt-eyebrow-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #6ee7b7;
    box-shadow: 0 0 8px #6ee7b7;
    animation: vt-pulse 2s infinite;
  }
  @keyframes vt-pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
  .vt-title {
    font-size: clamp(28px, 4vw, 44px); font-weight: 800;
    color: #fff; letter-spacing: -0.02em; line-height: 1.1; margin: 0 0 6px;
  }
  .vt-subtitle { font-size: 14px; color: #64748b; margin: 0; }
  .vt-export-btn {
    display: flex; align-items: center;
    background: rgba(110,231,183,0.08); border: 1px solid rgba(110,231,183,0.2);
    color: #6ee7b7; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600;
    padding: 10px 18px; border-radius: var(--radius-md); cursor: pointer;
    transition: background var(--duration-normal) var(--ease-in-out), border-color var(--duration-normal) var(--ease-in-out);
  }
  .vt-export-btn:hover { background: rgba(110,231,183,0.14); border-color: rgba(110,231,183,0.4); }
  .vt-stats {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;
  }
  .vt-stat-card {
    background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07);
    border-radius: var(--radius-lg); padding: 20px 22px; transition: border-color var(--duration-normal) var(--ease-in-out);
  }
  .vt-stat-card:hover { border-color: rgba(110,231,183,0.2); }
  .vt-stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #475569; font-weight: 600; margin-bottom: 8px; }
  .vt-stat-value { font-size: 22px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
  .vt-stat-sub   { font-size: 12px; color: #475569; }
  .vt-filters {
    background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 16px 18px; margin-bottom: 32px;
    display: flex; flex-direction: column; gap: 12px;
  }
  .vt-search-wrap { position: relative; }
  .vt-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #475569; }
  .vt-search {
    width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: var(--radius-md); color: #e2e8f0; font-family: 'JetBrains Mono', monospace;
    font-size: 13px; padding: 9px 12px 9px 34px; outline: none; box-sizing: border-box;
    transition: border-color var(--duration-normal) var(--ease-in-out);
  }
  .vt-search::placeholder { color: #334155; }
  .vt-search:focus { border-color: rgba(110,231,183,0.3); }
  .vt-filter-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  .vt-select-wrap { position: relative; }
  .vt-select {
    appearance: none;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    color: #94a3b8; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600;
    padding: 8px 30px 8px 12px; border-radius: 7px; cursor: pointer; outline: none;
    transition: border-color var(--duration-normal) var(--ease-in-out);
  }
  .vt-select:hover, .vt-select:focus { border-color: rgba(110,231,183,0.25); color: #e2e8f0; }
  .vt-amount-range { display: flex; align-items: center; gap: 6px; }
  .vt-amount-input {
    width: 90px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    color: #94a3b8; font-family: 'JetBrains Mono', monospace; font-size: 12px;
    padding: 8px 10px; border-radius: 7px; outline: none; transition: border-color var(--duration-normal) var(--ease-in-out);
  }
  .vt-amount-input:focus { border-color: rgba(110,231,183,0.25); }
  .vt-amount-input::placeholder { color: #334155; }
  .vt-amount-sep { color: #334155; font-size: 13px; }
  .vt-sort-btn {
    display: flex; align-items: center;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    color: #94a3b8; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600;
    padding: 8px 12px; border-radius: 7px; cursor: pointer; transition: all var(--duration-normal) var(--ease-in-out);
  }
  .vt-sort-btn:hover { color: #e2e8f0; border-color: rgba(110,231,183,0.25); }
  .vt-clear-btn {
    background: transparent; border: 1px solid rgba(252,165,165,0.2);
    color: #fca5a5; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600;
    padding: 8px 14px; border-radius: 7px; cursor: pointer; transition: all var(--duration-normal) var(--ease-in-out);
  }
  .vt-clear-btn:hover { background: rgba(252,165,165,0.08); }
  .vt-clear-btn--lg { padding: 10px 20px; font-size: 13px; margin-top: 12px; }
  .vt-section { margin-bottom: 28px; }
  .vt-section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .vt-section-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .vt-section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
  .vt-section-count {
    font-size: 11px; background: rgba(255,255,255,0.06); border-radius: var(--radius-full);
    padding: 2px 8px; color: #64748b; font-family: 'JetBrains Mono', monospace;
  }
  .vt-tx-list { display: flex; flex-direction: column; gap: 4px; }
  .vt-tx-row {
    display: flex; align-items: center; gap: 14px;
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
    border-radius: 10px; padding: 14px 16px; cursor: pointer;
    transition: background var(--duration-fast) var(--ease-in-out), border-color var(--duration-fast) var(--ease-in-out); min-height: 64px;
  }
  .vt-tx-row:hover { background: rgba(255,255,255,0.045); border-color: rgba(110,231,183,0.15); }
  .vt-tx-icon {
    width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .vt-tx-main { flex: 1; min-width: 0; }
  .vt-tx-top { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; flex-wrap: wrap; }
  .vt-tx-type { font-size: 13px; font-weight: 700; }
  .vt-tx-vault { font-size: 12px; color: #64748b; }
  .vt-tx-memo { font-size: 11px; color: #334155; font-style: italic; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px; }
  .vt-tx-bottom { display: flex; align-items: center; gap: 10px; }
  .vt-tx-hash {
    font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #475569;
    background: none; border: none; cursor: pointer; padding: 0;
    display: flex; align-items: center; gap: 3px; transition: color var(--duration-fast) var(--ease-in-out);
  }
  .vt-tx-hash:hover { color: #94a3b8; }
  .vt-tx-explorer { font-size: 11px; color: #334155; text-decoration: none; transition: color var(--duration-fast) var(--ease-in-out); }
  .vt-tx-explorer:hover { color: #6ee7b7; }
  .vt-tx-amount { text-align: right; flex-shrink: 0; }
  .vt-tx-amount-val { display: block; font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 500; color: #f1f5f9; }
  .vt-tx-xlm { font-size: 10px; color: #475569; margin-left: 4px; }
  .vt-tx-fee { display: block; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #334155; margin-top: 3px; }
  .vt-tx-right { text-align: right; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
  .vt-tx-status {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
    padding: 3px 9px; border-radius: var(--radius-full);
  }
  .vt-status-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .vt-tx-time { font-size: 11px; color: #334155; }
  .vt-retry-btn {
    background: rgba(252,165,165,0.08); border: 1px solid rgba(252,165,165,0.2);
    color: #fca5a5; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
    padding: 5px 10px; border-radius: 6px; cursor: pointer; flex-shrink: 0; transition: all var(--duration-normal) var(--ease-in-out);
  }
  .vt-retry-btn:hover { background: rgba(252,165,165,0.15); }
  .vt-empty { text-align: center; padding: 56px 24px; }
  .vt-empty-icon { font-size: 36px; margin-bottom: 14px; opacity: 0.2; }
  .vt-empty-title { font-size: 16px; font-weight: 700; color: #e2e8f0; margin-bottom: 6px; }
  .vt-empty-sub { font-size: 13px; color: #475569; }
  .vt-modal-backdrop {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(8,11,18,0.85); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
    animation: vt-fadeIn var(--duration-normal) var(--ease-out);
  }
  @keyframes vt-fadeIn { from { opacity: 0 } to { opacity: 1 } }
  .vt-modal {
    background: #0e1420; border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--radius-xl); padding: 28px; width: 100%; max-width: 580px;
    max-height: 90vh; overflow-y: auto; position: relative;
    animation: vt-slideUp var(--duration-normal) var(--ease-out);
  }
  @keyframes vt-slideUp { from { transform: translateY(16px); opacity:0 } to { transform: translateY(0); opacity:1 } }
  .vt-modal-close {
    position: absolute; top: 18px; right: 18px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    color: #64748b; font-size: 13px; width: 28px; height: 28px; border-radius: 6px;
    cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all var(--duration-fast) var(--ease-in-out);
  }
  .vt-modal-close:hover { color: #e2e8f0; background: rgba(255,255,255,0.08); }
  .vt-modal-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
  .vt-modal-icon { width: 44px; height: 44px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .vt-modal-type { font-size: 16px; font-weight: 800; margin-bottom: 3px; }
  .vt-modal-vault { font-size: 13px; color: #64748b; }
  .vt-modal-grid { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
  .vt-modal-row2 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .vt-field-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #334155; font-weight: 700; margin-bottom: 5px; }
  .vt-field-value { font-size: 13px; color: #e2e8f0; word-break: break-all; }
  .vt-modal-hash-row { display: flex; align-items: center; gap: 8px; }
  .vt-modal-hash { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #94a3b8; word-break: break-all; }
  .vt-mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
  .vt-modal-amount { font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 600; color: #f1f5f9; }
  .vt-copy-btn {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    color: #94a3b8; padding: 4px 8px; border-radius: 5px; cursor: pointer;
    flex-shrink: 0; font-size: 12px; transition: all var(--duration-fast) var(--ease-in-out);
  }
  .vt-copy-btn:hover { color: #e2e8f0; background: rgba(255,255,255,0.09); }
  .vt-raw-section { margin-bottom: 20px; }
  .vt-raw-toggle {
    background: none; border: none; color: #475569; font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; transition: color var(--duration-fast) var(--ease-in-out);
  }
  .vt-raw-toggle:hover { color: #94a3b8; }
  .vt-raw-pre {
    font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748b;
    background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05);
    border-radius: var(--radius-md); padding: 14px; margin-top: 10px; overflow-x: auto; white-space: pre;
  }
  .vt-modal-footer { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; }
  .vt-explorer-link {
    font-size: 13px; color: #6ee7b7; text-decoration: none; font-weight: 600; transition: opacity var(--duration-fast) var(--ease-in-out);
  }
  .vt-explorer-link:hover { opacity: 0.75; }

  @media (max-width: 680px) {
    .vt-wrap { padding: 28px 16px 60px; }
    .vt-stats { grid-template-columns: 1fr 1fr; }
    .vt-stats > :last-child { grid-column: span 2; }
    .vt-tx-memo { display: none; }
    .vt-tx-amount { display: none; }
    .vt-modal-row2 { grid-template-columns: 1fr 1fr; }
    .vt-filter-row { gap: 8px; }
    .vt-amount-range { display: none; }
  }
  @media (max-width: 480px) {
    .vt-stats { grid-template-columns: 1fr; }
    .vt-stats > :last-child { grid-column: span 1; }
    .vt-header { flex-direction: column; align-items: flex-start; }
    .vt-modal-row2 { grid-template-columns: 1fr; }
  }
  .vt-sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0;
    margin: -1px; overflow: hidden; clip: rect(0,0,0,0);
    white-space: nowrap; border: 0;
  }
`;
