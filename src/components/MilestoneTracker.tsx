import { Text } from "./Text";
import "./MilestoneTracker.css";

export type MilestoneStatus = "pending" | "validated" | "failed";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  criteria: string;
  status: MilestoneStatus;
  validatedAt?: string;
  evidenceUrl?: string;
}

export interface MilestoneTrackerProps {
  milestones: Milestone[];
}

const MILESTONE_STATUS_CONFIG: Record<
  MilestoneStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "is-pending" },
  validated: { label: "Validated", className: "is-validated" },
  failed: { label: "Failed", className: "is-failed" },
};

function formatValidatedAt(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MilestoneTracker({ milestones }: MilestoneTrackerProps) {
  if (milestones.length === 0) {
    return (
      <Text
        role="body"
        as="p"
        className="milestone-tracker-empty"
        aria-live="polite"
      >
        No milestones have been defined for this vault.
      </Text>
    );
  }

  const currentIndex = milestones.findIndex(
    (milestone) => milestone.status === "pending",
  );

  return (
    <ol className="milestone-tracker" aria-label="Vault milestone progress">
      {milestones.map((milestone, index) => {
        const status = MILESTONE_STATUS_CONFIG[milestone.status];
        const isCurrent = index === currentIndex;

        return (
          <li
            key={milestone.id}
            className={`milestone-tracker-step ${status.className}`}
            aria-current={isCurrent ? "step" : undefined}
          >
            <div className="milestone-tracker-marker" aria-hidden="true">
              {index + 1}
            </div>
            <div className="milestone-tracker-content">
              <div className="milestone-tracker-header">
                <Text role="body" as="h3" className="milestone-tracker-title">
                  {milestone.title}
                </Text>
                <span className="milestone-tracker-badge">{status.label}</span>
              </div>

              <Text role="caption" as="p" className="milestone-tracker-copy">
                {milestone.description}
              </Text>
              <Text role="caption" as="p" className="milestone-tracker-copy">
                <strong>Criteria:</strong> {milestone.criteria}
              </Text>

              <div className="milestone-tracker-meta">
                {milestone.validatedAt && (
                  <Text
                    role="caption"
                    as="span"
                    className="milestone-tracker-validated-at"
                  >
                    Validated {formatValidatedAt(milestone.validatedAt)}
                  </Text>
                )}
                {milestone.evidenceUrl && (
                  <a
                    className="milestone-tracker-evidence"
                    href={milestone.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View evidence
                  </a>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
