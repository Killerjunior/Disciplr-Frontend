import { Link } from 'react-router-dom';
import { Text } from './Text';
import React from 'react';

export type VaultStatus = 'active' | 'pending_validation' | 'completed' | 'failed';

export interface VaultCardProps {
  id: string;
  name: string;
  amount: number;
  currency: string;
  status: VaultStatus;
  deadline: string;
  progressPct: number;
  linkTo?: string;
}

function daysRemaining(deadline: string): number {
  return Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 86400000));
}

function StatusBadge({ status }: { status: VaultStatus }) {
  const config = {
    active: { label: 'Active', bg: 'var(--accent-transparent)', fg: 'var(--accent)' },
    pending_validation: { label: 'Pending', bg: 'var(--warning-transparent)', fg: 'var(--warning)' },
    completed: { label: 'Completed', bg: 'var(--success-transparent)', fg: 'var(--success)' },
    failed: { label: 'Failed', bg: 'var(--danger-transparent)', fg: 'var(--danger)' },
  }[status];

  return (
    <span
      style={{
        background: config.bg,
        color: config.fg,
        border: `1px solid ${config.fg}`,
        borderRadius: 'var(--radius-full)',
        padding: '2px 8px',
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {config.label}
    </span>
  );
}

export default function VaultCard({
  id,
  name,
  amount,
  currency,
  status,
  deadline,
  progressPct,
  linkTo,
}: VaultCardProps) {
  const days = daysRemaining(deadline);
  const link = linkTo ?? `/vaults/${id}`;

  return (
    <Link to={link} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '0.875rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 4,
          boxShadow: 'var(--elevated)',
        }}
      >
        <div>
          <Text role="body" as="div" style={{ fontWeight: 600, marginBottom: 2 }}>
            {name}
          </Text>
          <Text role="caption" as="div" style={{ color: 'var(--accent)', fontWeight: 700 }}>
            {amount.toLocaleString()} {currency}
          </Text>
          <Text role="caption" as="div" style={{ color: 'var(--muted)' }}>
            {`Deadline: ${new Date(deadline).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })} (${days}d left)`}
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusBadge status={status} />
        </div>
      </div>
    </Link>
  );
}
