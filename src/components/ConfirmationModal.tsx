import React, { useState, useEffect } from 'react';
import FocusTrap from 'focus-trap-react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Text } from './Text';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (decision: 'approve' | 'reject', notes: string) => void;
  initialDecision?: 'approve' | 'reject';
  initialNotes?: string;
  evidenceUrl?: string;
}

/**
 * ConfirmationModal component for validation approval/rejection.
 * 
 * Features:
 * - Focus trapping for accessibility
 * - Escape key support
 * - Accessible labels and roles (aria-modal)
 * - Captures verifier notes
 * - States irreversible on-chain consequence
 * - Shows evidence link if present
 */
export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  initialDecision,
  initialNotes = '',
  evidenceUrl,
}: ConfirmationModalProps) {
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(initialDecision || null);
  const [notes, setNotes] = useState(initialNotes);

  useEffect(() => {
    if (isOpen) {
      setDecision(initialDecision || null);
      setNotes(initialNotes);
    }
  }, [isOpen, initialDecision, initialNotes]);

  const handleConfirm = () => {
    if (decision) {
      onConfirm(decision, notes);
    }
  };

  const isConfirmDisabled = !decision || (decision === 'reject' && !notes.trim());

  return (
    <AnimatePresence>
      {isOpen && (
        <FocusTrap focusTrapOptions={{ allowOutsideClick: true, escapeDeactivates: true, onDeactivate: onClose }}>
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <Text role="title" as="h2" id="modal-title" className="text-gray-900 dark:text-white">
                  Confirm Validation
                </Text>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
                {/* Decision Selection */}
                <div className="flex flex-col gap-3">
                  <Text role="body" as="span" className="font-semibold text-gray-700 dark:text-gray-300">
                    Final Decision
                  </Text>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setDecision('approve')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        decision === 'approve'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800'
                      }`}
                    >
                      <CheckCircle size={18} />
                      <span className="font-medium">Approve</span>
                    </button>
                    <button
                      onClick={() => setDecision('reject')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        decision === 'reject'
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-800'
                      }`}
                    >
                      <XCircle size={18} />
                      <span className="font-medium">Reject</span>
                    </button>
                  </div>
                </div>

                {/* Warning Message */}
                {decision && (
                  <div className={`p-4 rounded-lg flex gap-3 ${
                    decision === 'approve' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                  }`}>
                    <AlertTriangle className="flex-shrink-0" size={20} />
                    <div>
                      <Text role="caption" as="p" className="font-bold mb-1">
                        {decision === 'approve' ? 'Irreversible Action' : 'Action Notification'}
                      </Text>
                      <Text role="caption" as="p">
                        {decision === 'approve'
                          ? 'Approval will trigger an on-chain transaction to release vault funds. This action cannot be undone.'
                          : 'Rejection will notify the vault owner to revise and resubmit. Funds will remain locked in the vault.'}
                      </Text>
                    </div>
                  </div>
                )}

                {/* Evidence Link */}
                {evidenceUrl && (
                  <div className="flex flex-col gap-2">
                    <Text role="body" as="span" className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                      Review Evidence
                    </Text>
                    <a
                      href={evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline w-fit"
                    >
                      <ExternalLink size={14} />
                      View submitted proof
                    </a>
                  </div>
                )}

                {/* Notes */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="modal-notes">
                    <Text role="body" as="span" className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                      Verification Notes {decision === 'reject' && <span className="text-red-500">*</span>}
                    </Text>
                  </label>
                  <textarea
                    id="modal-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={decision === 'reject' ? "Reason for rejection is required..." : "Add optional comments for the owner..."}
                    className="w-full min-h-[100px] p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                  {decision === 'reject' && !notes.trim() && (
                    <Text role="caption" as="span" className="text-red-500">
                      Notes are required for rejection.
                    </Text>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isConfirmDisabled}
                  className={`px-6 py-2 text-sm font-bold text-white rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${
                    decision === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 shadow-green-200 dark:shadow-none'
                      : decision === 'reject'
                      ? 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Confirm {decision ? (decision.charAt(0).toUpperCase() + decision.slice(1)) : ''}
                </button>
              </div>
            </motion.div>
          </div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
}
