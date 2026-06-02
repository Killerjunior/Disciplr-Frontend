# Confirmation Modal Flow

The validation process includes a critical confirmation step before any on-chain action (approval) or owner notification (rejection) is committed. This ensures verifiers have reviewed their notes and understand the consequences of their decision.

## Flow Overview

1.  **Initial Review**: Verifier reviews the milestone details and evidence on the `ValidationDetail` page.
2.  **Trigger Action**: Verifier clicks either "Approve Milestone" or "Reject Milestone".
3.  **Confirmation Modal**: An accessible modal opens, requiring the verifier to:
    *   Confirm the final decision (Approve/Reject).
    *   Review the irreversible on-chain consequence (for approvals).
    *   Provide or finalize verification notes (mandatory for rejections).
    *   Optionally re-verify the evidence link.
4.  **Execution**: Upon clicking "Confirm", the selected action is dispatched to the store, and the verifier is redirected back to the queue.

## Accessibility Features

The `ConfirmationModal` component implements the following a11y patterns:

*   **Focus Trap**: Managed via `focus-trap-react` to prevent keyboard focus from leaving the modal while open.
*   **Escape Support**: Pressing the `Escape` key closes the modal.
*   **Aria Roles**: Uses `role="dialog"` and `aria-modal="true"`.
*   **Aria Labeling**: Linked to the modal title via `aria-labelledby`.
*   **Live Regions**: Success/Error feedback is handled via the store and subsequent page transitions.

## Modal Messaging

| Decision | Consequence Message | Destination / Action |
| :--- | :--- | :--- |
| **Approve** | Approval will trigger an on-chain transaction to release vault funds. This action cannot be undone. | Funds released to vault owner. |
| **Reject** | Rejection will notify the vault owner to revise and resubmit. Funds will remain locked in the vault. | Owner notified to resubmit. |

## Implementation Details

Component: `src/components/ConfirmationModal.tsx`

```tsx
<ConfirmationModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onConfirm={executeAction}
  initialDecision={confirmAction}
  initialNotes={notes}
  evidenceUrl={task.evidenceUrl}
/>
```

The "Confirm" button is disabled until:
1.  A decision (Approve or Reject) is selected.
2.  If Reject is selected, notes must be non-empty.
