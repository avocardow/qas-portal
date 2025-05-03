/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createCallerFactory } from '@/server/api/trpc';
import { clientRouter } from './client';

// Tests for the getLifetimeData query, ensuring aggregation and sorting logic
describe('getLifetimeData query logic', () => {
  let ctx: any;
  let callClient: any;

  beforeEach(() => {
    callClient = createCallerFactory(clientRouter);
    ctx = {
      db: {
        client: {
          findUniqueOrThrow: vi.fn(),
        },
        documentReference: {
          findMany: vi.fn(),
        },
      },
      session: { user: { role: 'Admin', id: 'userId' } },
    } as any;
  });

  it('should return totalFees and empty history when no document references', async () => {
    ctx.db.client.findUniqueOrThrow.mockResolvedValue({ estAnnFees: { toNumber: () => 150 } });
    ctx.db.documentReference.findMany.mockResolvedValue([]);
    const caller = callClient(ctx);
    const result = await caller.getLifetimeData({ clientId: '11111111-1111-1111-1111-111111111111' });
    expect(result.totalFees).toBe(150);
    expect(result.feeHistory).toEqual([]);
  });

  it('should return feeHistory sorted by date with correct values', async () => {
    ctx.db.client.findUniqueOrThrow.mockResolvedValue({ estAnnFees: 200 });
    const docs = [
      { createdAt: new Date('2023-03-01') },
      { createdAt: new Date('2023-01-01') },
      { createdAt: new Date('2023-02-01') },
    ];
    ctx.db.documentReference.findMany.mockResolvedValue(docs);
    const caller = callClient(ctx);
    const result = await caller.getLifetimeData({ clientId: '22222222-2222-2222-2222-222222222222' });
    expect(result.totalFees).toBe(200);
    expect(result.feeHistory).toEqual([
      { date: '2023-01-01', value: 200 },
      { date: '2023-02-01', value: 200 },
      { date: '2023-03-01', value: 200 },
    ]);
  });
});
