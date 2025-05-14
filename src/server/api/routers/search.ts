import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { z } from 'zod';

export const searchRouter = createTRPCRouter({
  searchClients: publicProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      const term = input;
      // Restrict to active clients for certain roles
      const role = ctx.session?.user?.role;
      const restrictActiveRoles = ['Admin', 'Manager', 'Auditor', 'Staff'];
      const statusFilter = restrictActiveRoles.includes(role ?? '') ? { status: 'active' } : {};
      const clients = await ctx.db.client.findMany({
        where: {
          ...statusFilter,
          OR: [
            { clientName: { contains: term, mode: 'insensitive' } },
            { city: { contains: term, mode: 'insensitive' } },
            { address: { contains: term, mode: 'insensitive' } },
            { contacts: { some: { name: { contains: term, mode: 'insensitive' } } } },
            { licenses: { some: { licenseNumber: { contains: term, mode: 'insensitive' } } } },
            {
              audits: {
                some: {
                  assignments: {
                    some: {
                      user: { name: { contains: term, mode: 'insensitive' } },
                    },
                  },
                },
              },
            },
            {
              audits: {
                some: {
                  stage: {
                    name: { contains: term, mode: 'insensitive' },
                  },
                },
              },
            },
            { trustAccounts: { some: { bankName: { contains: term, mode: 'insensitive' } } } },
            { trustAccounts: { some: { accountName: { contains: term, mode: 'insensitive' } } } },
            { trustAccounts: { some: { managementSoftware: { contains: term, mode: 'insensitive' } } } },
            { trustAccounts: { some: { bsb: { contains: term, mode: 'insensitive' } } } },
            { trustAccounts: { some: { accountNumber: { contains: term, mode: 'insensitive' } } } },
          ],
        },
        distinct: ['id'],
        select: { id: true, clientName: true },
      });
      return clients;
    }),
}); 