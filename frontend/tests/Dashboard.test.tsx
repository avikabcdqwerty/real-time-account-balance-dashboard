/**
 * Unit and integration tests for the Dashboard component.
 * Covers loading, success, error, and empty states.
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Dashboard from '../src/components/Dashboard';
import * as useBalancesHook from '../src/hooks/useBalances';

// Mock account data
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
  {
    accountId: 'acc-2',
    accountType: 'savings',
    accountName: 'High Yield Savings',
    currency: 'USD',
    balance: 5000,
    availableBalance: 5000,
    status: 'active',
    lastUpdated: new Date().toISOString(),
  },
];

describe('Dashboard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    jest.spyOn(useBalancesHook, 'default').mockReturnValue({
      accounts: [],
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<Dashboard />);
    expect(screen.getByText(/loading account balances/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders account list when balances are loaded', async () => {
    jest.spyOn(useBalancesHook, 'default').mockReturnValue({
      accounts: mockAccounts,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<Dashboard />);
    expect(screen.getByText(/account balances/i)).toBeInTheDocument();
    expect(screen.getByText(/main checking/i)).toBeInTheDocument();
    expect(screen.getByText(/high yield savings/i)).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(mockAccounts.length + 1); // +1 for header row
  });

  it('renders empty state when no accounts are linked', () => {
    jest.spyOn(useBalancesHook, 'default').mockReturnValue({
      accounts: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<Dashboard />);
    expect(screen.getByText(/no linked accounts found/i)).toBeInTheDocument();
  });

  it('renders error banner and allows retry', async () => {
    const refetchMock = jest.fn();
    jest.spyOn(useBalancesHook, 'default').mockReturnValue({
      accounts: [],
      loading: false,
      error: 'Unable to retrieve account balances.',
      refetch: refetchMock,
    });

    render(<Dashboard />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/unable to retrieve account balances/i)).toBeInTheDocument();

    // Retry button should call refetch
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    expect(refetchMock).toHaveBeenCalled();
  });

  it('is accessible with proper roles and labels', () => {
    jest.spyOn(useBalancesHook, 'default').mockReturnValue({
      accounts: mockAccounts,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<Dashboard />);
    expect(screen.getByRole('main', { name: /account balance dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText(/account balances/i)).toHaveAttribute('tabindex', '0');
  });
});