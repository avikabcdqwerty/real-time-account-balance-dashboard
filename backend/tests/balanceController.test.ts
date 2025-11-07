/**
 * Unit and integration tests for balanceController.
 * Covers authentication, success, and error scenarios.
 */

import request from 'supertest';
import { app } from '../src/server';
import * as balanceService from '../src/services/balanceService';
import * as authService from '../src/services/authService';

jest.mock('../src/services/balanceService');
jest.mock('../src/services/authService');

const mockUserId = 'user-123';
const mockJWT = 'mock.jwt.token';

const validAuthHeader = `Bearer ${mockJWT}`;

const mockBalances = [
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

describe('balanceController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/balances', () => {
    it('should return 401 if Authorization header is missing', async () => {
      const res = await request(app).get('/api/balances');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required.');
    });

    it('should return 401 if JWT is invalid', async () => {
      (authService.verifyJWT as jest.Mock).mockImplementation(() => {
        throw new Error('InvalidToken');
      });

      const res = await request(app)
        .get('/api/balances')
        .set('Authorization', 'Bearer invalid.token');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid authentication token.');
    });

    it('should return 401 if JWT is expired', async () => {
      (authService.verifyJWT as jest.Mock).mockImplementation(() => {
        throw new Error('TokenExpired');
      });

      const res = await request(app)
        .get('/api/balances')
        .set('Authorization', validAuthHeader);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid authentication token.');
    });

    it('should return 200 and balances for valid JWT', async () => {
      (authService.verifyJWT as jest.Mock).mockReturnValue({ sub: mockUserId });
      (balanceService.getAggregatedBalances as jest.Mock).mockResolvedValue(mockBalances);

      const res = await request(app)
        .get('/api/balances')
        .set('Authorization', validAuthHeader);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accounts');
      expect(Array.isArray(res.body.accounts)).toBe(true);
      expect(res.body.accounts.length).toBe(2);
      expect(res.body.accounts[0]).toHaveProperty('accountId', 'acc-1');
    });

    it('should return 503 if CBSConnectionError occurs', async () => {
      (authService.verifyJWT as jest.Mock).mockReturnValue({ sub: mockUserId });
      const err = new Error('CBSConnectionError');
      err.name = 'CBSConnectionError';
      (balanceService.getAggregatedBalances as jest.Mock).mockRejectedValue(err);

      const res = await request(app)
        .get('/api/balances')
        .set('Authorization', validAuthHeader);

      expect(res.status).toBe(503);
      expect(res.body).toHaveProperty('error', 'Unable to retrieve account data. Please try again later.');
    });

    it('should return 504 if TimeoutError occurs', async () => {
      (authService.verifyJWT as jest.Mock).mockReturnValue({ sub: mockUserId });
      const err = new Error('TimeoutError');
      err.name = 'TimeoutError';
      (balanceService.getAggregatedBalances as jest.Mock).mockRejectedValue(err);

      const res = await request(app)
        .get('/api/balances')
        .set('Authorization', validAuthHeader);

      expect(res.status).toBe(504);
      expect(res.body).toHaveProperty('error', 'Balance retrieval timed out. Please try again.');
    });

    it('should return 500 for unexpected errors', async () => {
      (authService.verifyJWT as jest.Mock).mockReturnValue({ sub: mockUserId });
      (balanceService.getAggregatedBalances as jest.Mock).mockRejectedValue(new Error('Unexpected'));

      const res = await request(app)
        .get('/api/balances')
        .set('Authorization', validAuthHeader);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error', 'An unexpected error occurred. Please contact support.');
    });
  });
});