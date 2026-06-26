import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Text } from '../components/Text';
import { useVerifierStore } from '../Zustand/Store';

export default function PendingValidations() {
  const navigate = useNavigate();
  const { pendingValidations } = useVerifierStore();
  
  // Optional: Simple state to handle sorting by days remaining
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedValidations = [...pendingValidations].sort((a, b) => {
    return sortOrder === 'asc' 
      ? a.daysRemaining - b.daysRemaining 
      : b.daysRemaining - a.daysRemaining;
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-2">
        <div>
          <button 
            onClick={() => navigate('/verifier')}
            className="text-gray-500 hover:text-gray-800 mb-2 text-sm font-medium transition"
          >
            &larr; Back to Dashboard
          </button>
          <Text role="display" as="h1">Pending Validations</Text>
          <Text role="body" as="p" className="text-gray-500 mt-1">
            Review and validate milestones submitted by vault owners.
          </Text>
        </div>
        
        <button 
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition"
        >
          Sort by Urgency: {sortOrder === 'asc' ? 'High to Low' : 'Low to High'}
        </button>
      </header>

      <section className="bg-white border rounded-lg shadow-sm overflow-x-auto">
        {sortedValidations.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Text role="body" as="h3">All caught up!</Text>
            <Text role="body" as="p" className="mt-2">There are no pending validations in your queue.</Text>
          </div>
        ) : (
          <table className="w-full text-left border-collapse" aria-label="Pending Validations">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th scope="col" className="p-4 font-medium text-sm text-gray-600">Vault & Milestone</th>
                <th scope="col" className="p-4 font-medium text-sm text-gray-600">Owner</th>
                <th scope="col" className="p-4 font-medium text-sm text-gray-600">Amount at Stake</th>
                <th scope="col" className="p-4 font-medium text-sm text-gray-600" aria-sort={sortOrder === 'asc' ? 'ascending' : 'descending'}>Deadline</th>
                <th scope="col" className="p-4 font-medium text-sm text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedValidations.map((task) => (
                <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-4">
                    <Text role="body" as="p" className="font-semibold text-gray-800">{task.vaultName}</Text>
                    <Text role="body" as="p" className="text-sm text-gray-500 mt-1">{task.milestone}</Text>
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-mono">
                      {task.owner}
                    </span>
                  </td>
                  <td className="p-4">
                    <Text role="body" as="p" className="font-medium text-gray-800">{task.amount}</Text>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <Text role="body" as="p" className="text-sm">{task.deadline}</Text>
                      <span className={`text-sm font-medium ${task.daysRemaining <= 3 ? 'text-red-600' : 'text-green-600'}`}>
                        {task.daysRemaining} days left
                      </span>
                      {task.daysRemaining <= 3 && (
                        <span className="sr-only">Urgent</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => navigate(`/verifier/queue/${task.id}`)}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition text-sm font-medium"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
