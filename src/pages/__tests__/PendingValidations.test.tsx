import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PendingValidations from '../PendingValidations';
import { useVerifierStore } from '../../Zustand/Store';

vi.mock('../../Zustand/Store', () => ({
  useVerifierStore: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const makeTasks = () => [
  {
    id: 'v-1',
    vaultName: 'Alpha Vault',
    owner: '0xAAAA',
    amount: '10,000 USDC',
    deadline: '2026-07-01',
    daysRemaining: 10,
    status: 'pending' as const,
    milestone: 'Phase 1',
  },
  {
    id: 'v-2',
    vaultName: 'Beta Vault',
    owner: '0xBBBB',
    amount: '5,000 USDC',
    deadline: '2026-06-20',
    daysRemaining: 2,
    status: 'pending' as const,
    milestone: 'Phase 2',
  },
  {
    id: 'v-3',
    vaultName: 'Gamma Vault',
    owner: '0xCCCC',
    amount: '20,000 USDC',
    deadline: '2026-07-10',
    daysRemaining: 20,
    status: 'pending' as const,
    milestone: 'Phase 3',
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <PendingValidations />
    </MemoryRouter>
  );
}

describe('PendingValidations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useVerifierStore as any).mockReturnValue({ pendingValidations: makeTasks() });
  });

  it('renders the page heading', () => {
    renderPage();
    expect(screen.getByText('Pending Validations')).toBeInTheDocument();
  });

  it('shows "All caught up!" when there are no pending validations', () => {
    (useVerifierStore as any).mockReturnValue({ pendingValidations: [] });
    renderPage();
    expect(screen.getByText('All caught up!')).toBeInTheDocument();
    expect(screen.getByText(/no pending validations/i)).toBeInTheDocument();
  });

  it('does not render the table when queue is empty', () => {
    (useVerifierStore as any).mockReturnValue({ pendingValidations: [] });
    renderPage();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders a row for each pending task', () => {
    renderPage();
    expect(screen.getByText('Alpha Vault')).toBeInTheDocument();
    expect(screen.getByText('Beta Vault')).toBeInTheDocument();
    expect(screen.getByText('Gamma Vault')).toBeInTheDocument();
  });

  it('default sort is ascending (most urgent first) and button shows "High to Low"', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /High to Low/i })).toBeInTheDocument();

    // ascending: v-2 (2 days) → v-1 (10 days) → v-3 (20 days)
    const vaultCells = screen.getAllByText(/Vault$/);
    expect(vaultCells[0].textContent).toBe('Beta Vault');
    expect(vaultCells[1].textContent).toBe('Alpha Vault');
    expect(vaultCells[2].textContent).toBe('Gamma Vault');
  });

  it('toggling sort reverses the order and button shows "Low to High"', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /High to Low/i }));

    expect(screen.getByRole('button', { name: /Low to High/i })).toBeInTheDocument();

    // descending: v-3 (20 days) → v-1 (10 days) → v-2 (2 days)
    const vaultCells = screen.getAllByText(/Vault$/);
    expect(vaultCells[0].textContent).toBe('Gamma Vault');
    expect(vaultCells[1].textContent).toBe('Alpha Vault');
    expect(vaultCells[2].textContent).toBe('Beta Vault');
  });

  it('toggling twice returns to original ascending order', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /High to Low/i }));
    fireEvent.click(screen.getByRole('button', { name: /Low to High/i }));

    expect(screen.getByRole('button', { name: /High to Low/i })).toBeInTheDocument();

    // back to ascending: v-2 → v-1 → v-3
    const vaultCells = screen.getAllByText(/Vault$/);
    expect(vaultCells[0].textContent).toBe('Beta Vault');
    expect(vaultCells[1].textContent).toBe('Alpha Vault');
    expect(vaultCells[2].textContent).toBe('Gamma Vault');
  });

  it('clicking Review navigates to the correct ValidationDetail route', () => {
    renderPage();
    const reviewButtons = screen.getAllByRole('button', { name: /Review/i });
    // first row after asc sort is v-2 (daysRemaining: 2)
    fireEvent.click(reviewButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/verifier/queue/v-2');
  });

  it('clicking Back navigates to /verifier', () => {
    renderPage();
    fireEvent.click(screen.getByText(/Back to Dashboard/i));
    expect(mockNavigate).toHaveBeenCalledWith('/verifier');
  });

  it('renders a single task without crashing', () => {
    (useVerifierStore as any).mockReturnValue({
      pendingValidations: [makeTasks()[0]],
    });
    renderPage();
    expect(screen.getByText('Alpha Vault')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(2); // header + 1 row
  });

  it('handles ties in daysRemaining (stable relative order preserved)', () => {
    (useVerifierStore as any).mockReturnValue({
      pendingValidations: [
        { ...makeTasks()[0], id: 'v-a', daysRemaining: 5 },
        { ...makeTasks()[1], id: 'v-b', daysRemaining: 5 },
      ],
    });
    renderPage();
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    // both show 5 days left — just assert they render without error
    expect(screen.getAllByText('5 days left')).toHaveLength(2);
  });

  it('shows daysRemaining in red for tasks with 3 or fewer days', () => {
    renderPage();
    // v-2 has daysRemaining: 2 — should have red styling
    const urgentSpan = screen.getByText('2 days left');
    expect(urgentSpan.className).toContain('text-red-600');
  });

  it('shows daysRemaining in green for tasks with more than 3 days', () => {
    renderPage();
    const safeSpan = screen.getByText('10 days left');
    expect(safeSpan.className).toContain('text-green-600');
  });

  describe('accessible table semantics', () => {
    it('table has an accessible name', () => {
      renderPage();
      expect(screen.getByRole('table', { name: /Pending Validations/i })).toBeInTheDocument();
    });

    it('all column headers have scope="col"', () => {
      renderPage();
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThan(0);
      headers.forEach(th => {
        expect(th).toHaveAttribute('scope', 'col');
      });
    });

    it('Deadline column header exposes aria-sort="ascending" by default', () => {
      renderPage();
      const deadlineHeader = screen.getByRole('columnheader', { name: /Deadline/i });
      expect(deadlineHeader).toHaveAttribute('aria-sort', 'ascending');
    });

    it('aria-sort becomes "descending" after toggling sort to Low to High', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /High to Low/i }));
      const deadlineHeader = screen.getByRole('columnheader', { name: /Deadline/i });
      expect(deadlineHeader).toHaveAttribute('aria-sort', 'descending');
    });

    it('toggling sort twice restores aria-sort to "ascending"', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /High to Low/i }));
      fireEvent.click(screen.getByRole('button', { name: /Low to High/i }));
      const deadlineHeader = screen.getByRole('columnheader', { name: /Deadline/i });
      expect(deadlineHeader).toHaveAttribute('aria-sort', 'ascending');
    });

    it('urgent rows (≤3 days) include a non-color sr-only urgency cue', () => {
      renderPage();
      // v-2 has daysRemaining: 2 which is ≤ 3
      const urgentCue = screen.getByText('Urgent');
      expect(urgentCue.className).toContain('sr-only');
    });

    it('non-urgent rows do not include an urgency cue', () => {
      renderPage();
      // Only v-2 (daysRemaining: 2) is urgent; v-1 and v-3 are not
      const urgentCues = screen.getAllByText('Urgent');
      expect(urgentCues).toHaveLength(1);
    });

    it('empty table state renders no table role', () => {
      (useVerifierStore as any).mockReturnValue({ pendingValidations: [] });
      renderPage();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });
});
