import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VaultTransactions from '../../pages/VaultTransactions';

// ── Clock setup ──────────────────────────────────────────────────────────────
// MOCK_TRANSACTIONS timestamps are computed as (Date.now() - offset) at module
// init time (when VaultTransactions.tsx is first imported). Capturing Date.now()
// here — right after the import resolves — and then freezing to that value means
// fmtTime() at render time sees the same reference point, so "2h ago", "45m ago"
// etc. are deterministic across every run without relying on the wall clock.
const FIXED_NOW = Date.now();
vi.useFakeTimers();
vi.setSystemTime(FIXED_NOW);

describe('VaultTransactions', () => {
  beforeEach(() => {
    // jsdom may not provide navigator.clipboard; stub it so the copy handler
    // doesn't throw when hash/address copy buttons are rendered.
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── TxType label + color (TYPE_META) ──────────────────────────────────────
  describe('TxType metadata', () => {
    it.each([
      ['Create',   '#6ee7b7'],
      ['Validate', '#93c5fd'],
      ['Release',  '#fcd34d'],
      ['Redirect', '#f9a8d4'],
    ])('renders type label "%s" with color %s', (label, color) => {
      const { container } = render(<VaultTransactions />);
      const typeSpans = Array.from(container.querySelectorAll('.vt-tx-type'));
      const match = typeSpans.find(el => el.textContent?.trim() === label);
      expect(match, `expected a .vt-tx-type span with text "${label}"`).toBeDefined();
      expect(match).toHaveStyle({ color });
    });
  });

  // ── TxStatus label + color (STATUS_META) ─────────────────────────────────
  describe('TxStatus metadata', () => {
    it.each([
      ['Confirmed', '#6ee7b7'],
      ['Pending',   '#fcd34d'],
      ['Failed',    '#fca5a5'],
    ])('renders status label "%s" with color %s', (label, color) => {
      const { container } = render(<VaultTransactions />);
      // .vt-tx-status spans are the badge elements; section heading spans use
      // .vt-section-title and carry no inline color style, so this query is precise.
      const statusSpans = Array.from(container.querySelectorAll('.vt-tx-status'));
      const match = statusSpans.find(el => el.textContent?.includes(label));
      expect(match, `expected a .vt-tx-status badge with text "${label}"`).toBeDefined();
      expect(match).toHaveStyle({ color });
    });
  });

  // ── Hash truncation (truncHash) ───────────────────────────────────────────
  describe('hash truncation', () => {
    it('shows first-8 + "..." + last-6 for a known 64-char hash', () => {
      render(<VaultTransactions />);
      // tx1 hash: a3f9d1c8e2b74056af3d9c1b2e8f0a4d7c5e9b3f1a2d4c6e8b0f2a4c6d8e0f2a  (64 chars)
      // truncHash(hash, 8, 6) → slice(0,8) + '...' + slice(-6)
      //   = 'a3f9d1c8' + '...' + '8e0f2a'  →  'a3f9d1c8...8e0f2a'
      const hashButtons = screen.getAllByTitle('Copy hash');
      const tx1Btn = hashButtons.find(btn => btn.textContent?.includes('a3f9d1c8...8e0f2a'));
      expect(tx1Btn, 'expected a hash button displaying "a3f9d1c8...8e0f2a"').toBeDefined();
    });

    it('every visible hash button follows the 8-char head + "..." + 6-char tail pattern', () => {
      render(<VaultTransactions />);
      const hashButtons = screen.getAllByTitle('Copy hash');
      expect(hashButtons.length).toBeGreaterThan(0);
      hashButtons.forEach(btn => {
        // Match any 8 chars, literal '...', then any 6 chars
        expect(btn.textContent).toMatch(/.{8}\.\.\..{6}/);
      });
    });
  });

  // ── Relative timestamps (fmtTime) ─────────────────────────────────────────
  describe('relative timestamp display', () => {
    it('renders "Xm ago" labels for transactions within the last hour', () => {
      render(<VaultTransactions />);
      // MOCK_TRANSACTIONS offsets include 2m, 5m, 10m, 20m, 45m
      const minuteLabels = screen.getAllByText(/^\d+m ago$/);
      expect(minuteLabels.length).toBeGreaterThan(0);
    });

    it('renders "Xh ago" labels for transactions older than 60 minutes', () => {
      render(<VaultTransactions />);
      // MOCK_TRANSACTIONS offsets include 1.5h (→1h), 2h, 3.5h (→3h), 5h, 8h
      const hourLabels = screen.getAllByText(/^\d+h ago$/);
      expect(hourLabels.length).toBeGreaterThan(0);
    });

    it('never exposes raw ISO-8601 strings in transaction rows', () => {
      render(<VaultTransactions />);
      // ISO strings should only appear in the raw-data section of the modal (closed by default)
      expect(screen.queryByText(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)).not.toBeInTheDocument();
    });
  });

  // ── From / To address display (modal) ─────────────────────────────────────
  describe('transaction detail modal', () => {
    it('shows the from and to addresses when a row is clicked', () => {
      const { container } = render(<VaultTransactions />);
      // Rows render: Pending section first (tx8, tx4), then Failed (tx6), then Confirmed.
      // rows[0] is tx8 (redirect, Alpha Vault): from "GCVAULT...M3P", to "GBVZ3...QK7L"
      const rows = container.querySelectorAll('.vt-tx-row');
      expect(rows.length).toBeGreaterThan(0);
      fireEvent.click(rows[0]);

      expect(screen.getByText('GCVAULT...M3P')).toBeInTheDocument();
      expect(screen.getByText('GBVZ3...QK7L')).toBeInTheDocument();
    });

    it('closes the modal when the backdrop is clicked', () => {
      const { container } = render(<VaultTransactions />);
      const rows = container.querySelectorAll('.vt-tx-row');
      fireEvent.click(rows[0]);
      expect(container.querySelector('.vt-modal')).toBeInTheDocument();

      fireEvent.click(container.querySelector('.vt-modal-backdrop')!);
      expect(container.querySelector('.vt-modal')).not.toBeInTheDocument();
    });

    it('displays the full hash in the modal, not the truncated form', () => {
      const { container } = render(<VaultTransactions />);
      const rows = container.querySelectorAll('.vt-tx-row');
      fireEvent.click(rows[0]);
      // tx8 full hash
      const fullHash = 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3';
      expect(screen.getByText(fullHash)).toBeInTheDocument();
    });
  });

  // ── Filter behaviour (no network dependency) ──────────────────────────────
  describe('filter controls', () => {
    it('shows only confirmed transactions when the Confirmed status filter is applied', () => {
      const { container } = render(<VaultTransactions />);
      const selects = container.querySelectorAll('.vt-select');
      // Third select is the status filter
      fireEvent.change(selects[2], { target: { value: 'confirmed' } });

      // Pending and Failed sections should disappear
      expect(screen.queryByText('Pending')).not.toBeInTheDocument();
      expect(screen.queryByText('Failed')).not.toBeInTheDocument();
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
    });

    it('hash search filters the list to matching transactions only', () => {
      render(<VaultTransactions />);
      const searchInput = screen.getByPlaceholderText(/search by transaction hash/i);
      // tx1 hash starts with 'a3f9d1c8'; no other hash shares this prefix
      fireEvent.change(searchInput, { target: { value: 'a3f9d1c8' } });

      const hashButtons = screen.getAllByTitle('Copy hash');
      expect(hashButtons).toHaveLength(1);
      expect(hashButtons[0].textContent).toMatch(/^a3f9d1c8/);
    });
  });
});
