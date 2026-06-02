import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ValidationDetail from '../ValidationDetail';
import { useVerifierStore } from '../../Zustand/Store';

// Mock focus-trap-react as it can be tricky in jsdom
vi.mock('focus-trap-react', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Zustand store
vi.mock('../../Zustand/Store', () => ({
  useVerifierStore: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ vaultId: 'v-101' }),
  };
});

const mockPendingValidations = [
  {
    id: 'v-101',
    vaultName: 'Test Vault',
    owner: '0x123',
    amount: '100 USDC',
    deadline: '2026-06-01',
    daysRemaining: 10,
    status: 'pending',
    milestone: 'Test Milestone',
    evidenceUrl: 'https://example.com/evidence',
  },
];

describe('ValidationDetail Page', () => {
  const mockApproveValidation = vi.fn();
  const mockRejectValidation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useVerifierStore as any).mockReturnValue({
      pendingValidations: mockPendingValidations,
      approveValidation: mockApproveValidation,
      rejectValidation: mockRejectValidation,
    });
  });

  it('renders task details correctly', () => {
    render(
      <MemoryRouter initialEntries={['/verifier/v-101']}>
        <ValidationDetail />
      </MemoryRouter>
    );

    expect(screen.getByText('Review Milestone')).toBeInTheDocument();
    expect(screen.getByText('Task ID: v-101')).toBeInTheDocument();
    expect(screen.getByText('Test Vault')).toBeInTheDocument();
    expect(screen.getByText('Test Milestone')).toBeInTheDocument();
  });

  it('shows "Validation Not Found" if task does not exist', () => {
    (useVerifierStore as any).mockReturnValue({
      pendingValidations: [],
      approveValidation: mockApproveValidation,
      rejectValidation: mockRejectValidation,
    });

    render(
      <MemoryRouter initialEntries={['/verifier/v-999']}>
        <ValidationDetail />
      </MemoryRouter>
    );

    expect(screen.getByText('Validation Not Found')).toBeInTheDocument();
  });

  it('opens confirmation modal when clicking approve', async () => {
    render(
      <MemoryRouter initialEntries={['/verifier/v-101']}>
        <ValidationDetail />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Approve Milestone'));

    expect(screen.getByText('Confirm Validation')).toBeInTheDocument();
    expect(screen.getByText(/Approval will trigger an on-chain transaction/)).toBeInTheDocument();
  });

  it('opens confirmation modal when clicking reject', async () => {
    render(
      <MemoryRouter initialEntries={['/verifier/v-101']}>
        <ValidationDetail />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Reject Milestone'));

    expect(screen.getByText('Confirm Validation')).toBeInTheDocument();
    expect(screen.getByText(/Rejection will notify the vault owner/)).toBeInTheDocument();
  });

  it('executes approveValidation and navigates back', async () => {
    render(
      <MemoryRouter initialEntries={['/verifier/v-101']}>
        <ValidationDetail />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Approve Milestone'));
    
    // In the modal
    const confirmBtn = screen.getByRole('button', { name: /Confirm Approve/i });
    fireEvent.click(confirmBtn);

    expect(mockApproveValidation).toHaveBeenCalledWith('v-101', '');
    expect(mockNavigate).toHaveBeenCalledWith('/verifier/queue');
  });

  it('executes rejectValidation with notes and navigates back', async () => {
    render(
      <MemoryRouter initialEntries={['/verifier/v-101']}>
        <ValidationDetail />
      </MemoryRouter>
    );

    // Enter initial notes
    const initialNotesArea = screen.getByPlaceholderText(/Start adding your review notes here/i);
    fireEvent.change(initialNotesArea, { target: { value: 'Evidence is missing details.' } });

    fireEvent.click(screen.getByText('Reject Milestone'));
    
    // In the modal
    const modalNotesArea = screen.getByPlaceholderText(/Reason for rejection is required/i);
    expect(modalNotesArea).toHaveValue('Evidence is missing details.');

    const confirmBtn = screen.getByRole('button', { name: /Confirm Reject/i });
    fireEvent.click(confirmBtn);

    expect(mockRejectValidation).toHaveBeenCalledWith('v-101', 'Evidence is missing details.');
    expect(mockNavigate).toHaveBeenCalledWith('/verifier/queue');
  });

  it('disables confirm button for rejection if notes are empty', async () => {
    render(
      <MemoryRouter initialEntries={['/verifier/v-101']}>
        <ValidationDetail />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Reject Milestone'));
    
    const confirmBtn = screen.getByRole('button', { name: /Confirm Reject/i });
    expect(confirmBtn).toBeDisabled();

    const modalNotesArea = screen.getByPlaceholderText(/Reason for rejection is required/i);
    fireEvent.change(modalNotesArea, { target: { value: 'Now it has notes' } });

    expect(confirmBtn).not.toBeDisabled();
  });

  it('renders "No evidence link provided" when task has no evidenceUrl', () => {
    (useVerifierStore as any).mockReturnValue({
      pendingValidations: [{ ...mockPendingValidations[0], evidenceUrl: undefined }],
      approveValidation: mockApproveValidation,
      rejectValidation: mockRejectValidation,
    });

    render(
      <MemoryRouter initialEntries={['/verifier/v-101']}>
        <ValidationDetail />
      </MemoryRouter>
    );

    expect(screen.getByText('No evidence link provided.')).toBeInTheDocument();
  });

  it('allows switching decision inside the modal', async () => {
    render(
      <MemoryRouter initialEntries={['/verifier/v-101']}>
        <ValidationDetail />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Approve Milestone'));
    
    expect(screen.getByText(/Approval will trigger an on-chain transaction/)).toBeInTheDocument();

    // Target the Reject button specifically inside the modal
    const modal = screen.getByRole('dialog');
    const rejectBtn = within(modal).getByRole('button', { name: /Reject/i });
    fireEvent.click(rejectBtn);

    expect(screen.getByText(/Rejection will notify the vault owner/)).toBeInTheDocument();
  });
});
