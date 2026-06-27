export type VaultStatus = "active" | "pending_validation" | "completed" | "failed";

export interface VaultPreview {
  id: string;
  name: string;
  amount: number;
  currency: string;
  status: VaultStatus;
  progressPct: number;
  deadline: string;
}

export interface Activity {
  id: string;
  type: "created" | "validated" | "released" | "redirected";
  vault: string;
  timestamp: string;
  amount?: number;
}

export interface Deadline {
  id: string;
  name: string;
  deadline: string;
  amount: number;
}

export interface DashboardSummary {
  totalLocked: number;
  activeVaults: number;
  pendingMilestones: number;
  completionRate: number;
}

export interface FormattedDeadline extends Deadline {
  daysRemaining: number;
  urgencyColor: string;
  formattedDays: string;
  formattedAmount: string;
  formattedDate: string;
}

export interface FormattedActivity extends Activity {
  formattedAmount?: string;
  relativeTime: string;
}

export function daysRemaining(deadline: string, now: number = Date.now()): number {
  return Math.max(
    0,
    Math.ceil((new Date(deadline).getTime() - now) / 86400000)
  );
}

export function urgencyColor(days: number): string {
  if (days <= 7) return "var(--danger)";
  if (days <= 30) return "var(--warning)";
  return "var(--success)";
}

export function relativeTime(iso: string, now: number = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function formatSummary(summary: DashboardSummary) {
  return {
    totalLocked: `$${summary.totalLocked.toLocaleString()}`,
    activeVaults: String(summary.activeVaults),
    pendingMilestones: String(summary.pendingMilestones),
    completionRate: `${summary.completionRate}%`,
  };
}

export function processDeadlines(deadlines: Deadline[], now: number = Date.now()): FormattedDeadline[] {
  return [...deadlines]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .map((d) => {
      const days = daysRemaining(d.deadline, now);
      const color = urgencyColor(days);
      return {
        ...d,
        daysRemaining: days,
        urgencyColor: color,
        formattedDays: days === 0 ? "Today" : `${days}d`,
        formattedAmount: `${d.amount.toLocaleString()} USDC`,
        formattedDate: new Date(d.deadline).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };
    });
}

export function processActivity(activities: Activity[], now: number = Date.now()): FormattedActivity[] {
  return [...activities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map((a) => {
      return {
        ...a,
        formattedAmount: a.amount != null ? `${a.amount.toLocaleString()} USDC` : undefined,
        relativeTime: relativeTime(a.timestamp, now),
      };
    });
}
