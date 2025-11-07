/**
 * Accessibility tests for UI components using jest-axe.
 * Ensures WCAG 2.1 AA compliance for key dashboard components.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Dashboard from '../src/components/Dashboard';
import AccountList from '../src/components/AccountList';
import ErrorBanner from '../src/components/ErrorBanner';

expect.extend(toHaveNoViolations);

const mockAccounts = [
  {
    accountId: 'acc-1',
    accountType: 'checking',
    accountName: 'Main Checking',
    currency: 'USD',
    balance: 1000.5,
    availableBalance: 950.5,
    status: 'active',
    lastUpdated: new Date().toISOString(),
  },
];

describe('Accessibility', () => {
  it('Dashboard component should have no accessibility violations', async () => {
    const { container } = render(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('AccountList component should have no accessibility violations', async () => {
    const { container } = render(<AccountList accounts={mockAccounts} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ErrorBanner component should have no accessibility violations', async () => {
    const { container } = render(
      <ErrorBanner message="Unable to retrieve account balances." onRetry={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});