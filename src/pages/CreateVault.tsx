import { useState } from 'react'
import { Text } from '../components/Text'
import { Field } from '../components/Field'

export default function CreateVault() {
  const [amount, setAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [successAddress, setSuccessAddress] = useState('')
  const [failureAddress, setFailureAddress] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Placeholder: will call backend / contract
    console.log({ amount, deadline, successAddress, failureAddress })
  }

  return (
    <div>
      <Text role="display" as="h1" style={{ marginBottom: '0.5rem' }}>
        Create Vault
      </Text>
      <Text role="body" as="p" style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
        Lock USDC with a deadline and milestone. Funds release on validation or redirect on failure.
      </Text>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          maxWidth: 400,
        }}
      >
        <Field
          label="Amount (USDC)"
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1000"
          required
        />
        <Field
          label="Deadline (ISO date)"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
        <Field
          label="Success destination (Stellar address)"
          type="text"
          value={successAddress}
          onChange={(e) => setSuccessAddress(e.target.value)}
          placeholder="G..."
          required
        />
        <Field
          label="Failure destination (Stellar address)"
          type="text"
          value={failureAddress}
          onChange={(e) => setFailureAddress(e.target.value)}
          placeholder="G..."
          required
        />
        <button
          type="submit"
          style={{
            background: 'var(--accent)',
            color: 'var(--bg)',
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius)',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '0.5rem',
            minHeight: '44px',
            minWidth: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text role="caption" as="span">
            Create Vault
          </Text>
        </button>
      </form>
    </div>
  )
}
