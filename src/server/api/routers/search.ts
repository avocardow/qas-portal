import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { Prisma, ClientStatus } from '@prisma/client';
import { z } from 'zod';

export const searchRouter = createTRPCRouter({
  searchClients: publicProcedure
    .input(z.string().min(1))
    .query(async ({ ctx, input }) => {
      const term = input;
      const role = ctx.session?.user?.role;
      const restrictActiveRoles = ['Admin', 'Manager', 'Auditor', 'Staff'];
      const ORFilter: Prisma.ClientWhereInput['OR'] = [
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
      ];
      const where: Prisma.ClientWhereInput = restrictActiveRoles.includes(role ?? '')
        ? { status: ClientStatus.active, OR: ORFilter }
        : { OR: ORFilter };
      const clients = await ctx.db.client.findMany({
        where: where,
        distinct: ['id'],
        select: { id: true, clientName: true },
      });
      return clients;
    }),
}); 