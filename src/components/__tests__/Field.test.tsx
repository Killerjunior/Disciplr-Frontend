import React from 'react'
import { render, screen } from '@testing-library/react'
import { Field } from '../Field'

describe('Field component', () => {
  test('renders label and input', () => {
    render(<Field label="Test Label" />)
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
  })

  test('renders hint text', () => {
    render(<Field label="Test Label" hint="This is a hint" />)
    expect(screen.getByText('This is a hint')).toBeInTheDocument()
  })

  test('renders error text and sets aria-invalid', () => {
    render(<Field label="Test Label" error="This is an error" />)
    expect(screen.getByText('This is an error')).toBeInTheDocument()
    const input = screen.getByLabelText('Test Label')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  test('renders required indicator', () => {
    render(<Field label="Test Label" required />)
    const input = screen.getByLabelText('Test Label')
    expect(input).toBeRequired()
  })
})
