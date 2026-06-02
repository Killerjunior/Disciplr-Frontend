import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from '../../Layout';

describe('Layout component navigation', () => {
  test('transactions link receives active class and aria-current when on /transactions', () => {
    render(
      <MemoryRouter initialEntries={['/transactions']}>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /transactions/i });
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveClass('active');
  });

  test('transactions link is not active on other routes', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /transactions/i });
    expect(link).not.toHaveAttribute('aria-current');
    expect(link).not.toHaveClass('active');
  });
});
