import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VaultTransactions from '../VaultTransactions';

function renderPage() {
  return render(<VaultTransactions />);
}

describe('VaultTransactions', () => {
  describe('core rendering', () => {
    it('renders the page heading', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: /Transaction History/i })).toBeInTheDocument();
    });

    it('renders the export button', () => {
      renderPage();
      expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument();
    });

    it('renders all three status sections from mock data', () => {
      renderPage();
      // Mock data has pending, failed, and confirmed transactions
      expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Failed').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Confirmed').length).toBeGreaterThan(0);
    });
  });

  describe('accessible table semantics', () => {
    it('each non-empty status section is announced as a table', () => {
      renderPage();
      const tables = screen.getAllByRole('table');
      // Mock data has Pending (2 tx), Failed (1 tx), Confirmed (7 tx)
      expect(tables.length).toBeGreaterThanOrEqual(3);
    });

    it('every table has an accessible name', () => {
      renderPage();
      const tables = screen.getAllByRole('table');
      tables.forEach(table => {
        expect(table).toHaveAccessibleName();
      });
    });

    it('each table section has a descriptive label including its status', () => {
      renderPage();
      expect(screen.getByRole('table', { name: /Pending transactions/i })).toBeInTheDocument();
      expect(screen.getByRole('table', { name: /Failed transactions/i })).toBeInTheDocument();
      expect(screen.getByRole('table', { name: /Confirmed transactions/i })).toBeInTheDocument();
    });

    it('column headers are present in each table', () => {
      renderPage();
      const headers = screen.getAllByRole('columnheader');
      // 3 sections × 4 headers each
      expect(headers.length).toBeGreaterThanOrEqual(12);
    });

    it('transaction data rows are announced as table rows', () => {
      renderPage();
      const rows = screen.getAllByRole('row');
      // At minimum: 3 hidden header rows + 10 data rows
      expect(rows.length).toBeGreaterThanOrEqual(13);
    });

    it('status is conveyed via visible text, not color only', () => {
      renderPage();
      // Each tx row's status span includes a text label
      expect(screen.getAllByText('Confirmed').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Failed').length).toBeGreaterThan(0);
    });

    it('decorative status dots are hidden from screen readers', () => {
      const { container } = renderPage();
      const dots = container.querySelectorAll('.vt-status-dot');
      expect(dots.length).toBeGreaterThan(0);
      dots.forEach(dot => {
        expect(dot).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('decorative section accent dots are hidden from screen readers', () => {
      const { container } = renderPage();
      const dots = container.querySelectorAll('.vt-section-dot');
      expect(dots.length).toBeGreaterThan(0);
      dots.forEach(dot => {
        expect(dot).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('sort controls', () => {
    it('sort button defaults to newest-first', () => {
      renderPage();
      expect(screen.getByRole('button', { name: /Newest/i })).toBeInTheDocument();
    });

    it('clicking sort toggles to oldest-first', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /Newest/i }));
      expect(screen.getByRole('button', { name: /Oldest/i })).toBeInTheDocument();
    });

    it('clicking sort twice returns to newest-first', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /Newest/i }));
      fireEvent.click(screen.getByRole('button', { name: /Oldest/i }));
      expect(screen.getByRole('button', { name: /Newest/i })).toBeInTheDocument();
    });
  });

  describe('filters', () => {
    it('clear button appears when a filter is applied', () => {
      renderPage();
      expect(screen.queryByRole('button', { name: /Clear/i })).not.toBeInTheDocument();
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'create' } });
      expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
    });

    it('clearing filters removes the clear button', () => {
      renderPage();
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'create' } });
      fireEvent.click(screen.getByRole('button', { name: /Clear/i }));
      expect(screen.queryByRole('button', { name: /Clear/i })).not.toBeInTheDocument();
    });
  });
});
