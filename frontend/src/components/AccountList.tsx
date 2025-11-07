/**
 * Component for rendering a list of accounts and their balances.
 * Ensures accessibility and responsive design.
 */

import React from 'react';

export interface Account {
  accountId: string;
  accountType: string;
  accountName: string;
  currency: string;
  balance: number;
  availableBalance: number;
  status: 'active' | 'closed' | 'pending';
  lastUpdated: string;
}

interface AccountListProps {
  accounts: Account[];
}

const AccountList: React.FC<AccountListProps> = ({ accounts }) => {
  return (
    <div className="overflow-x-auto" aria-label="Linked Accounts">
      <table className="min-w-full divide-y divide-gray-200" role="table">
        <caption className="sr-only">List of linked accounts and balances</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
            >
              Account Name
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
            >
              Type
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider"
            >
              Balance
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider"
            >
              Available
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
            >
              Last Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr
              key={account.accountId}
              className="hover:bg-gray-50 focus-within:bg-blue-50"
              tabIndex={0}
            >
              <td className="px-4 py-2 font-medium text-gray-900">
                {account.accountName}
              </td>
              <td className="px-4 py-2 text-gray-700">
                {account.accountType.charAt(0).toUpperCase() +
                  account.accountType.slice(1)}
              </td>
              <td className="px-4 py-2 text-right text-gray-900">
                {account.currency}{' '}
                {account.balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="px-4 py-2 text-right text-gray-700">
                {account.currency}{' '}
                {account.availableBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="px-4 py-2 text-gray-700">
                <span
                  className={
                    account.status === 'active'
                      ? 'inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded'
                      : account.status === 'pending'
                      ? 'inline-block px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded'
                      : 'inline-block px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-600 rounded'
                  }
                  aria-label={`Account status: ${account.status}`}
                >
                  {account.status.charAt(0).toUpperCase() +
                    account.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-2 text-gray-500">
                <time dateTime={account.lastUpdated}>
                  {new Date(account.lastUpdated).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccountList;