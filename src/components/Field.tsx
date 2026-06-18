import React from 'react'
import { Text } from './Text'

interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'label'> {
  label: string
  hint?: string
  error?: string
}

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, hint, error, id, required, ...props }, ref) => {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`
  const errorId = error ? `${fieldId}-error` : undefined
  const hintId = hint ? `${fieldId}-hint` : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <label htmlFor={fieldId}>
        <Text
          role="caption"
          as="span"
          style={{ display: 'block' }}
        >
          {label}
          {required && <span style={{ color: 'var(--danger)' }} aria-hidden="true">*</span>}
        </Text>
      </label>
      <input
        ref={ref}
        id={fieldId}
        required={required}
        aria-describedby={[errorId, hintId].filter(Boolean).join(' ')}
        aria-invalid={!!error}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: 'var(--radius)',
          border: error ? '1px solid var(--danger)' : '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text)',
        }}
        {...props}
      />
      {hint && !error && (
        <Text
          role="caption"
          as="span"
          id={hintId}
          style={{ color: 'var(--muted)' }}
        >
          {hint}
        </Text>
      )}
      {error && (
        <Text
          role="caption"
          as="span"
          id={errorId}
          style={{ color: 'var(--danger)' }}
        >
          {error}
        </Text>
      )}
    </div>
  )
  }
)

Field.displayName = 'Field'
