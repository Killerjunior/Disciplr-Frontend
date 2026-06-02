import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { WalletProvider, useWallet } from '../../context/WalletContext';

// Mock WalletContext to avoid real Freighter dependencies in tests
vi.mock('../../context/WalletContext', () => ({
  WalletProvider: ({ children }: any) => <>{children}</>,
  useWallet: () => ({
    address: null,
    network: null,
    balance: null,
    isConnecting: false,
    error: null,
    connect: async () => {},
    disconnect: () => {},
    checkConnection: async () => {},
  }),
}));

import Home from '../../pages/Home';

describe('Home page hero', () => {
  test('renders headline and subheadline', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const headline = screen.getByRole('heading', { level: 1, name: /Stake & Secure Your Goals with Disciplr/i });
    expect(headline).toBeInTheDocument();
    const subheadline = screen.getByText(/Time‑locked capital vaults on Stellar that release on validation or redirect on failure\./i);
    expect(subheadline).toBeInTheDocument();
  });

  test('has primary CTA linking to /vaults/create', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const cta = screen.getByRole('link', { name: /Create Your First Vault/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/vaults/create');
  });

  test('has secondary links to dashboard and vaults', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
    const vaultsLink = screen.getByRole('link', { name: /My Vaults/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(vaultsLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(vaultsLink).toHaveAttribute('href', '/vaults');
  });
});
