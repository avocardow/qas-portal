/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, it, expect, vi } from "vitest";
import { createCallerFactory } from "@/server/api/trpc";
import { clientRouter } from "./client";
import { TRPCError } from "@trpc/server";

describe("clientRouter updateSharepointFolderId", () => {
  let ctx: any;
  let callClient: any;
  const dummyClientId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

  beforeEach(() => {
    callClient = createCallerFactory(clientRouter);
    ctx = {
      db: {
        client: {
          update: vi.fn(),
        },
      },
      session: { user: { role: "Admin" } },
    } as any;
  });

  it("should update sharepointFolderId for Admin", async () => {
    const updated = { id: dummyClientId, internalFolderId: "folder123" };
    ctx.db.client.update.mockResolvedValue(updated);
    const caller = callClient(ctx);
    const result = await caller.updateSharepointFolderId({
      clientId: dummyClientId,
      internalFolderId: "folder123",
    });
    expect(ctx.db.client.update).toHaveBeenCalledWith({
      where: { id: dummyClientId },
      data: { internalFolderId: "folder123" },
    });
    expect(result).toEqual(updated);
  });

  it("should allow Manager role", async () => {
    ctx.session.user.role = "Manager";
    const updated = { id: dummyClientId, internalFolderId: "folder456" };
    ctx.db.client.update.mockResolvedValue(updated);
    const caller = callClient(ctx);
    const result = await caller.updateSharepointFolderId({
      clientId: dummyClientId,
      internalFolderId: "folder456",
    });
    expect(result).toEqual(updated);
  });

  it("should forbid non-Admin/Manager", async () => {
    ctx.session.user.role = "Client";
    const caller = callClient(ctx);
    await expect(
      caller.updateSharepointFolderId({
        clientId: dummyClientId,
        internalFolderId: "folder123",
      })
    ).rejects.toBeInstanceOf(TRPCError);
  });
});

describe("clientRouter getAll", () => {
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
      contacts: [{ name: "John", isPrimary: true }],
    },
    {
      id: "id2",
      clientName: "B Company",
      city: "CityB",
      status: "active",
      auditMonthEnd: 2,
      nextContactDate: new Date("2023-02-01"),
      estAnnFees: 200,
      contacts: [{ name: "Jane", isPrimary: false }],
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

  it("should return paginated clients for Admin with default parameters", async () => {
    ctx.db.client.count.mockResolvedValue(2);
    ctx.db.client.findMany.mockResolvedValue(dummyClients);
    const caller = callClient(ctx);
    const result = await caller.getAll({});
    expect(ctx.db.client.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.any(Object) })
    );
    expect(ctx.db.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10, skip: 0 })
    );
    // Include auditStageName field added by the router
    const expectedItemsAll = dummyClients.map(item => ({ ...item, auditStageName: null }));
    expect(result).toEqual({ items: expectedItemsAll, totalCount: 2 });
  });

  it("should filter and sort clients based on input", async () => {
    ctx.db.client.count.mockResolvedValue(1);
    const filteredClients = [dummyClients[1]];
    ctx.db.client.findMany.mockResolvedValue(filteredClients);
    const caller = callClient(ctx);
    const input = {
      page: 2,
      pageSize: 1,
      filter: "B",
      sortBy: "city",
      sortOrder: "desc",
      statusFilter: "active",
      showAll: false,
    };
    const result = await caller.getAll(input);
    expect(ctx.db.client.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: { in: ["active"] } }),
      })
    );
    expect(ctx.db.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 1, skip: 1, orderBy: { city: "desc" } })
    );
    // Include auditStageName field for filtered items
    const expectedFilteredItems = filteredClients.map(item => ({ ...item, auditStageName: null }));
    expect(result).toEqual({ items: expectedFilteredItems, totalCount: 1 });
  });

  it("should show all statuses when showAll is true", async () => {
    ctx.db.client.count.mockResolvedValue(3);
    ctx.db.client.findMany.mockResolvedValue([
      ...dummyClients,
      {
        id: "id3",
        clientName: "C",
        city: "CityC",
        status: "archived",
        auditMonthEnd: 3,
        nextContactDate: new Date("2023-03-01"),
        estAnnFees: 300,
        contacts: [],
      },
    ]);
    const caller = callClient(ctx);
    await caller.getAll({ showAll: true });
    expect(ctx.db.client.count).toHaveBeenCalledWith(
      expect.not.objectContaining({ status: expect.anything() })
    );
  });

  it("should return only associated client for Client role", async () => {
    const clientRecord = {
      id: "clientId",
      clientName: "MyClient",
      city: "MyCity",
      status: "active",
    };
    ctx.session.user.role = "Client";
    ctx.db.contact.findUnique.mockResolvedValue({ clientId: "clientId" });
    ctx.db.client.findUniqueOrThrow.mockResolvedValue(clientRecord);
    const caller = callClient(ctx);
    const result = await caller.getAll({});
    expect(ctx.db.contact.findUnique).toHaveBeenCalledWith({
      where: { portalUserId: ctx.session.user.id },
    });
    expect(result).toEqual({ items: [clientRecord], nextCursor: undefined });
  });

  it("should forbid Client role with no associated client", async () => {
    ctx.session.user.role = "Client";
    ctx.db.contact.findUnique.mockResolvedValue(null);
    const caller = callClient(ctx);
    await expect(caller.getAll({})).rejects.toBeInstanceOf(TRPCError);
  });

  it("should allow Manager role to fetch clients like Admin", async () => {
    ctx.session.user.role = "Manager";
    ctx.db.client.count.mockResolvedValue(2);
    ctx.db.client.findMany.mockResolvedValue(dummyClients);
    const caller = callClient(ctx);
    const result = await caller.getAll({});
    // Include auditStageName field for manager items
    const expectedManagerItems = dummyClients.map(item => ({ ...item, auditStageName: null }));
    expect(result).toEqual({ items: expectedManagerItems, totalCount: 2 });
  });

  it("should forbid unauthorized roles", async () => {
    ctx.session.user.role = "Unknown";
    const caller = callClient(ctx);
    await expect(caller.getAll({})).rejects.toBeInstanceOf(TRPCError);
  });
});

// Add tests for getById RBAC
describe("clientRouter getById", () => {
  let ctx: any;
  let callClient: any;
  const dummyClientId = "283ac3ae-7c54-405b-b9f8-f0fd2e39027e";
  const dummyClientData = {
    id: dummyClientId,
    clientName: "Test Client",
    abn: "ABN123",
    address: "123 Test St",
    city: "Test City",
    postcode: "12345",
    status: "active",
    auditMonthEnd: 5,
    nextContactDate: new Date("2023-05-01"),
    estAnnFees: 500,
    contacts: [{ name: "John Doe", isPrimary: true }],
    licenses: [],
    trustAccounts: [],
    audits: [],
    activityLogs: [],
    notes: [],
  };

  beforeEach(() => {
    callClient = createCallerFactory(clientRouter);
    ctx = {
      db: {
        contact: { findUnique: vi.fn() },
        client: { findUniqueOrThrow: vi.fn() },
      },
      session: { user: { role: "Admin", id: "user-id" } },
    } as any;
  });

  it("should return client details for Admin and Manager roles", async () => {
    ctx.session.user.role = "Admin";
    ctx.db.client.findUniqueOrThrow.mockResolvedValue(dummyClientData);
    const caller = callClient(ctx);
    const resultAdmin = await caller.getById({ clientId: dummyClientId });
    expect(ctx.db.client.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: dummyClientId },
      include: {
        contacts: true,
        licenses: true,
        trustAccounts: true,
        audits: true,
        activityLogs: true,
        notes: true,
      },
    });
    expect(resultAdmin).toEqual(dummyClientData);

    ctx.session.user.role = "Manager";
    ctx.db.client.findUniqueOrThrow.mockResolvedValue(dummyClientData);
    const resultManager = await caller.getById({ clientId: dummyClientId });
    expect(resultManager).toEqual(dummyClientData);
  });

  it("should return only own client for Client role", async () => {
    ctx.session.user.role = "Client";
    ctx.db.contact.findUnique.mockResolvedValue({ clientId: dummyClientId });
    ctx.db.client.findUniqueOrThrow.mockResolvedValue(dummyClientData);
    const caller = callClient(ctx);
    const result = await caller.getById({ clientId: dummyClientId });
    expect(ctx.db.contact.findUnique).toHaveBeenCalledWith({
      where: { portalUserId: ctx.session.user.id },
    });
    expect(result).toEqual(dummyClientData);
  });

  it("should forbid access for Client role to other clients", async () => {
    ctx.session.user.role = "Client";
    ctx.db.contact.findUnique.mockResolvedValue({ clientId: "other-id" });
    const caller = callClient(ctx);
    await expect(
      caller.getById({ clientId: dummyClientId })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("should forbid unauthorized roles", async () => {
    ctx.session.user.role = "Staff";
    const caller = callClient(ctx);
    await expect(
      caller.getById({ clientId: dummyClientId })
    ).rejects.toBeInstanceOf(TRPCError);
  });
});
