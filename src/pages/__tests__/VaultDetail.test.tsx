import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import VaultDetail from '../VaultDetail';

vi.mock('../../context/WalletContext', () => ({
  useWallet: () => ({ network: 'TESTNET' }),
}));

function renderVaultDetail(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/vaults/${id}`]}>
      <Routes>
        <Route path="/vaults/:id" element={<VaultDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('VaultDetail', () => {
  it('renders active vault status, milestones, transactions, addresses, and deadline', () => {
    renderVaultDetail('1');

    expect(screen.getByRole('heading', { name: 'Alpha Vault' })).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('12,500')).toBeInTheDocument();
    expect(screen.getAllByText('USDC').length).toBeGreaterThan(0);

    expect(screen.getByText('Status Timeline')).toBeInTheDocument();
    expect(screen.getByText(/Deadline Jul 15, 2024/)).toBeInTheDocument();
    // CountdownDeadline active vault should show time remaining or expired
    expect(screen.getByText(/Expired|remaining/)).toBeInTheDocument();

    const addresses = screen.getByText('Addresses').closest('div')?.parentElement;
    expect(addresses).toBeInTheDocument();
    expect(within(addresses!).getByText('Creator')).toBeInTheDocument();
    expect(within(addresses!).getByText('Verifier')).toBeInTheDocument();
    expect(within(addresses!).getByText('Success destination')).toBeInTheDocument();
    expect(within(addresses!).getByText('Failure destination')).toBeInTheDocument();
    expect(within(addresses!).getByText('Contract')).toBeInTheDocument();
    expect(within(addresses!).getByText('GBVZ3K...QK7L')).toBeInTheDocument();

    expect(screen.getByText('Phase 1 Complete')).toBeInTheDocument();
    expect(screen.getByText('Complete initial development phase')).toBeInTheDocument();
    expect(screen.getByText(/All unit tests passing, code reviewed/)).toBeInTheDocument();
    expect(screen.getByText('Validated')).toBeInTheDocument();
    expect(screen.getByText('Beta Launch')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View evidence/i })).toHaveAttribute(
      'href',
      'https://github.com/org/repo/pull/42',
    );

    expect(screen.getByText('Transaction History')).toBeInTheDocument();
    expect(screen.getByText('Vault Created')).toBeInTheDocument();
    expect(screen.getByText('Milestone Validated')).toBeInTheDocument();
    expect(screen.getAllByText('a3f9d1c8...8f0a4d').length).toBeGreaterThan(0);
    expect(screen.getAllByText('b4e0c2d9...9a5e8b').length).toBeGreaterThan(0);
  });

  it('renders completed vault release details without a verifier address', () => {
    renderVaultDetail('2');

    expect(screen.getByRole('heading', { name: 'Beta Reserve' })).toBeInTheDocument();
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
    expect(screen.queryByText('Verifier')).not.toBeInTheDocument();

    // Verify Countdown is replaced by status text
    expect(screen.queryByText(/Expired|remaining/)).not.toBeInTheDocument();
    expect(screen.getByText('Deadline Jan 1, 2024')).toBeInTheDocument();

    expect(screen.getByText('Project Delivery')).toBeInTheDocument();
    expect(screen.getByText(/All deliverables submitted and approved/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View evidence/i })).toHaveAttribute(
      'href',
      'https://docs.example.com/delivery',
    );

    expect(screen.getByText('Funds released')).toBeInTheDocument();
    expect(screen.getAllByText('4,200.5 USDC').length).toBeGreaterThan(0);
    expect(screen.getAllByText('c5f1d3e0...0b6f9c').length).toBeGreaterThan(0);
    // Success destination
    expect(screen.getAllByText('GSUCC3...LKQK').length).toBeGreaterThan(0);
  });

  it('renders failed vault milestone and redirect transaction details', () => {
    renderVaultDetail('3');

    expect(screen.getByRole('heading', { name: 'Gamma Fund' })).toBeInTheDocument();
    expect(screen.getAllByText('Failed').length).toBeGreaterThan(0);

    // Verify Countdown is replaced by status text
    expect(screen.queryByText(/Expired|remaining/)).not.toBeInTheDocument();

    expect(screen.getByText('Milestone 1')).toBeInTheDocument();
    expect(screen.getByText('Criteria not met')).toBeInTheDocument();

    expect(screen.getByText('Funds redirected')).toBeInTheDocument();
    expect(screen.getAllByText('8,800 USDC').length).toBeGreaterThan(0);
    expect(screen.getAllByText('d6a2e4f1...1c7a0d').length).toBeGreaterThan(0);
    // Failure destination
    expect(screen.getAllByText('GFAIL3...LKQK').length).toBeGreaterThan(0);
  });

  it('renders cancelled vault with mixed milestone statuses and redirect destination', () => {
    renderVaultDetail('4');

    expect(screen.getByRole('heading', { name: 'Delta Cancelled' })).toBeInTheDocument();
    expect(screen.getAllByText('Cancelled').length).toBeGreaterThan(0);

    // Verify Countdown is replaced by status text
    expect(screen.queryByText(/Expired|remaining/)).not.toBeInTheDocument();

    // Mixed milestones
    expect(screen.getByText('Milestone 1')).toBeInTheDocument();
    expect(screen.getByText('Validated')).toBeInTheDocument();
    expect(screen.getByText('Milestone 2')).toBeInTheDocument();
    // Use getAllByText for "Failed" since it appears for the status label too
    expect(screen.getAllByText('Failed').length).toBeGreaterThan(0);
    expect(screen.getByText('Milestone 3')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();

    expect(screen.getByText('Funds redirected')).toBeInTheDocument();
    expect(screen.getAllByText('5,000 USDC').length).toBeGreaterThan(0);
    // Failure destination
    expect(screen.getAllByText('GFAIL3...LKQK').length).toBeGreaterThan(0);
  });

  it('renders a not-found state for an unknown vault id', () => {
    renderVaultDetail('999');

    expect(screen.getByRole('heading', { name: 'Vault not found' })).toBeInTheDocument();
    expect(screen.getByText('No vault with ID "999" exists.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Vaults/i })).toHaveAttribute(
      'href',
      '/vaults',
    );
  });
});
