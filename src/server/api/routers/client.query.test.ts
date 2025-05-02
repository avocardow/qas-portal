/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createCallerFactory } from "@/server/api/trpc";
import { clientRouter } from "./client";

describe("clientRouter query logic and data transformations", () => {
  let ctx: any;
  let callClient: any;
  const dummyClients = [
    {
      id: "id1",
      clientName: "A Company",
      city: "CityA",
      status: "active",
      auditMonthEnd: 1,
      nextContactDate: new Date("2023-01-01"),
      estAnnFees: 100,
      contacts: [{ id: "contact1", name: "John", isPrimary: true, phone: null, email: null, title: null, canLoginToPortal: false, portalUserId: null, createdAt: new Date(), updatedAt: new Date(), clientId: "id1" }],
    },
    {
      id: "id2",
      clientName: "B Company",
      city: "CityB",
      status: "active",
      auditMonthEnd: 2,
      nextContactDate: new Date("2023-02-01"),
      estAnnFees: 200,
      contacts: [{ id: "contact2", name: "Jane", isPrimary: false, phone: null, email: null, title: null, canLoginToPortal: false, portalUserId: null, createdAt: new Date(), updatedAt: new Date(), clientId: "id2" }],
    },
  ];

  beforeEach(() => {
    callClient = createCallerFactory(clientRouter);
    ctx = {
      db: {
        client: {
          count: vi.fn(),
          findMany: vi.fn(),
          findUniqueOrThrow: vi.fn(),
        },
        contact: {
          findUnique: vi.fn(),
        },
      },
      session: { user: { role: "Admin", id: "userId" } },
    } as any;
    // Stub prisma $transaction to resolve an array of promises (count, findMany)
    ctx.db.$transaction = (ops: any[]) => Promise.all(ops);
  });

  describe("getAll query logic", () => {
    it("should correctly transform filter into case-insensitive search", async () => {
      ctx.db.client.count.mockResolvedValue(1);
      ctx.db.client.findMany.mockResolvedValue([dummyClients[0]]);
      const caller = callClient(ctx);
      await caller.getAll({ filter: "company" });
      
      // Verify the where clause for case-insensitive search
      expect(ctx.db.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              {
                clientName: {
                  contains: "company",
                  mode: "insensitive",
                },
              },
              {
                contacts: {
                  some: {
                    name: { contains: "company", mode: "insensitive" },
                  },
                },
              },
            ],
          }),
        })
      );
    });

    it("should correctly handle empty filter string", async () => {
      ctx.db.client.count.mockResolvedValue(2);
      ctx.db.client.findMany.mockResolvedValue(dummyClients);
      const caller = callClient(ctx);
      await caller.getAll({ filter: "" });
      
      // Verify empty string is handled correctly
      expect(ctx.db.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              {
                clientName: {
                  contains: "",
                  mode: "insensitive",
                },
              },
              {
                contacts: {
                  some: {
                    name: { contains: "", mode: "insensitive" },
                  },
                },
              },
            ],
          }),
        })
      );
    });

    it("should correctly transform pagination parameters", async () => {
      ctx.db.client.count.mockResolvedValue(5);
      ctx.db.client.findMany.mockResolvedValue(dummyClients);
      const caller = callClient(ctx);
      await caller.getAll({ page: 2, pageSize: 2 });
      
      // Verify pagination transformation
      expect(ctx.db.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 2,
          skip: 2, // (page - 1) * pageSize
        })
      );
    });

    it("should correctly transform sort parameters", async () => {
      ctx.db.client.count.mockResolvedValue(2);
      ctx.db.client.findMany.mockResolvedValue(dummyClients);
      const caller = callClient(ctx);
      await caller.getAll({ sortBy: "city", sortOrder: "desc" });
      
      // Verify sort parameter transformation
      expect(ctx.db.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { city: "desc" },
        })
      );
    });

    it("should correctly transform status filter", async () => {
      ctx.db.client.count.mockResolvedValue(1);
      ctx.db.client.findMany.mockResolvedValue([dummyClients[0]]);
      const caller = callClient(ctx);
      await caller.getAll({ statusFilter: "active", showAll: false });
      
      // Verify status filter transformation
      expect(ctx.db.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ["active"] },
          }),
        })
      );
    });

    it("should ignore status filter when showAll is true", async () => {
      ctx.db.client.count.mockResolvedValue(2);
      ctx.db.client.findMany.mockResolvedValue(dummyClients);
      const caller = callClient(ctx);
      await caller.getAll({ statusFilter: "active", showAll: true });
      
      // Verify status filter is not included when showAll is true
      expect(ctx.db.client.findMany).toHaveBeenCalledWith(
        expect.not.objectContaining({
          where: expect.objectContaining({
            status: expect.anything(),
          }),
        })
      );
    });

    it("should correctly select required fields", async () => {
      ctx.db.client.count.mockResolvedValue(2);
      ctx.db.client.findMany.mockResolvedValue(dummyClients);
      const caller = callClient(ctx);
      await caller.getAll({});
      
      // Verify field selection
      expect(ctx.db.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            id: true,
            clientName: true,
            status: true,
            auditMonthEnd: true,
            nextContactDate: true,
            estAnnFees: true,
            contacts: {
              select: {
                id: true,
                name: true,
                isPrimary: true,
                phone: true,
                email: true,
                title: true,
                canLoginToPortal: true,
                portalUserId: true,
                createdAt: true,
                updatedAt: true,
                clientId: true,
              },
            },
            audits: expect.objectContaining({
              // Ensure the latest audit's stage name is selected
              select: expect.objectContaining({
                stage: expect.objectContaining({
                  select: { name: true },
                }),
              }),
            }),
          }),
        })
      );
    });
  });

  describe("getById query logic", () => {
    const clientId = "cccccccc-cccc-cccc-cccc-cccccccccccc"; // Using valid UUID format

    it("should correctly select all required fields for Admin/Manager", async () => {
      ctx.db.client.findUniqueOrThrow.mockResolvedValue(dummyClients[0]);
      const caller = callClient(ctx);
      await caller.getById({ clientId });
      
      // Verify field selection for Admin/Manager
      expect(ctx.db.client.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: clientId },
        include: {
          assignedUser: true,
          contacts: {
            select: {
              id: true,
              name: true,
              isPrimary: true,
              phone: true,
              email: true,
              title: true,
              canLoginToPortal: true,
              portalUserId: true,
              createdAt: true,
              updatedAt: true,
              clientId: true,
            },
          },
          licenses: true,
          trustAccounts: true,
          audits: true,
          activityLogs: true,
          notes: true,
          documents: true,
        },
      });
    });

    it("should use the same field selection for Client role", async () => {
      ctx.session.user.role = "Client";
      const contact = { clientId, portalUserId: ctx.session.user.id };
      ctx.db.contact.findUnique.mockResolvedValue(contact);
      ctx.db.client.findUniqueOrThrow.mockResolvedValue(dummyClients[0]);
      
      const caller = callClient(ctx);
      await caller.getById({ clientId });
      
      // Verify field selection is the same for Client role
      expect(ctx.db.client.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: clientId },
        include: {
          assignedUser: true,
          contacts: {
            select: {
              id: true,
              name: true,
              isPrimary: true,
              phone: true,
              email: true,
              title: true,
              canLoginToPortal: true,
              portalUserId: true,
              createdAt: true,
              updatedAt: true,
              clientId: true,
            },
          },
          licenses: true,
          trustAccounts: true,
          audits: true,
          activityLogs: true,
          notes: true,
          documents: true,
        },
      });
    });
  });
}); 