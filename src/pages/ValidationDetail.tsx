import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Text } from '../components/Text';
import { useVerifierStore } from '../Zustand/Store';
import { ConfirmationModal } from '../components/ConfirmationModal';

export default function ValidationDetail() {
  const { vaultId } = useParams<{ vaultId: string }>();
  const navigate = useNavigate();
  
  // Pull data and actions from Zustand
  const { pendingValidations, approveValidation, rejectValidation } = useVerifierStore();
  
  // Local state for notes and the confirmation modal
  const [notes, setNotes] = useState('');
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Find the specific task based on the URL parameter
  const task = pendingValidations.find((t) => t.id === vaultId);

  if (!task) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-4">
        <Text role="display" as="h2">Validation Not Found</Text>
        <Text role="body" as="p" className="text-gray-500">
          This validation task may have already been processed or doesn't exist.
        </Text>
        <button 
          onClick={() => navigate('/verifier/queue')}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Return to Queue
        </button>
      </div>
    );
  }

  // Action Handlers
  const handleOpenModal = (action: 'approve' | 'reject') => {
    setConfirmAction(action);
    setIsModalOpen(true);
  };

  const executeAction = (decision: 'approve' | 'reject', modalNotes: string) => {
    if (decision === 'approve') {
      approveValidation(task.id, modalNotes);
    } else if (decision === 'reject') {
      rejectValidation(task.id, modalNotes);
    }
    setIsModalOpen(false);
    navigate('/verifier/queue'); // Send them back to the list
  };

  return (
    <div className="flex flex-col gap-6 p-6 relative">
      <header>
        <button 
          onClick={() => navigate('/verifier/queue')}
          className="text-gray-500 hover:text-gray-800 mb-4 text-sm font-medium transition"
        >
          &larr; Back to Queue
        </button>
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <Text role="display" as="h1">Review Milestone</Text>
            <Text role="body" as="p" className="text-gray-500 mt-1">
              Task ID: {task.id}
            </Text>
          </div>
          <div className={`px-4 py-2 rounded font-bold text-sm ${task.daysRemaining <= 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            Deadline: {task.daysRemaining} days remaining
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Evidence */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="p-6 border rounded-lg bg-white shadow-sm">
            <Text role="display" as="h2" className="mb-4">Vault Summary</Text>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text role="body" as="p" className="text-sm text-gray-500">Vault Name</Text>
                <Text role="body" as="p" className="font-medium">{task.vaultName}</Text>
              </div>
              <div>
                <Text role="body" as="p" className="text-sm text-gray-500">Owner Wallet</Text>
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-mono block w-max mt-1">
                  {task.owner}
                </span>
              </div>
              <div>
                <Text role="body" as="p" className="text-sm text-gray-500">Amount at Stake</Text>
                <Text role="body" as="p" className="font-bold text-green-700">{task.amount}</Text>
              </div>
              <div>
                <Text role="body" as="p" className="text-sm text-gray-500">Deadline Date</Text>
                <Text role="body" as="p" className="font-medium">{task.deadline}</Text>
              </div>
            </div>
          </section>

          <section className="p-6 border rounded-lg bg-white shadow-sm">
            <Text role="display" as="h2" className="mb-4">Milestone Evidence</Text>
            <div className="p-4 bg-gray-50 border rounded mb-4">
              <Text role="body" as="p" className="font-bold">Target Milestone:</Text>
              <Text role="body" as="p" className="mt-1">{task.milestone}</Text>
            </div>
            
            <Text role="body" as="p" className="font-bold mb-2">Submitted Proof:</Text>
            {task.evidenceUrl ? (
              <a 
                href={task.evidenceUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-block px-4 py-2 border border-blue-300 text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition font-medium text-sm"
              >
                &#128279; View Attached Evidence
              </a>
            ) : (
              <Text role="body" as="p" className="text-gray-500 italic">No evidence link provided.</Text>
            )}
          </section>
        </div>

        {/* Right Column: Verification Actions */}
        <div className="flex flex-col gap-4">
          <section className="p-6 border rounded-lg bg-white shadow-sm flex flex-col h-full">
            <Text role="display" as="h2" className="mb-4">Verification Actions</Text>
            
            <label className="flex flex-col gap-2 mb-6 flex-grow">
              <Text role="body" as="span" className="font-medium text-sm">Initial Verification Notes (Optional)</Text>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Start adding your review notes here..."
                className="w-full border rounded p-3 text-sm h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </label>

            <div className="flex flex-col gap-3 mt-auto">
              <button 
                onClick={() => handleOpenModal('approve')}
                className="w-full py-3 bg-green-600 text-white font-bold rounded hover:bg-green-700 transition"
              >
                Approve Milestone
              </button>
              <button 
                onClick={() => handleOpenModal('reject')}
                className="w-full py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition"
              >
                Reject Milestone
              </button>
            </div>
          </section>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={executeAction}
        initialDecision={confirmAction || undefined}
        initialNotes={notes}
        evidenceUrl={task.evidenceUrl}
      />
    </div>
  );
}