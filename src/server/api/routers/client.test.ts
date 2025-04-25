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
    const updated = { id: dummyClientId, sharepointFolderId: "folder123" };
    ctx.db.client.update.mockResolvedValue(updated);
    const caller = callClient(ctx);
    const result = await caller.updateSharepointFolderId({
      clientId: dummyClientId,
      sharepointFolderId: "folder123",
    });
    expect(ctx.db.client.update).toHaveBeenCalledWith({
      where: { id: dummyClientId },
      data: { sharepointFolderId: "folder123" },
    });
    expect(result).toEqual(updated);
  });

  it("should allow Manager role", async () => {
    ctx.session.user.role = "Manager";
    const updated = { id: dummyClientId, sharepointFolderId: "folder456" };
    ctx.db.client.update.mockResolvedValue(updated);
    const caller = callClient(ctx);
    const result = await caller.updateSharepointFolderId({
      clientId: dummyClientId,
      sharepointFolderId: "folder456",
    });
    expect(result).toEqual(updated);
  });

  it("should forbid non-Admin/Manager", async () => {
    ctx.session.user.role = "Client";
    const caller = callClient(ctx);
    await expect(
      caller.updateSharepointFolderId({
        clientId: dummyClientId,
        sharepointFolderId: "folder123",
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
    expect(result).toEqual({ items: dummyClients, totalCount: 2 });
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
    expect(result).toEqual({ items: filteredClients, totalCount: 1 });
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
    expect(result).toEqual({ items: dummyClients, totalCount: 2 });
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
  const dummyClientId = "id1";
  const fullClientRecord = {
    id: dummyClientId,
    clientName: "Test",
    city: "City",
    status: "active",
    contacts: [],
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
        client: {
          findUniqueOrThrow: vi.fn(),
        },
        contact: {
          findUnique: vi.fn(),
        },
      },
      session: { user: { role: "Admin", id: "userId" } },
    } as any;
  });

  it("should return client details for Admin", async () => {
    ctx.db.client.findUniqueOrThrow.mockResolvedValue(fullClientRecord);
    const caller = callClient(ctx);
    const result = await caller.getById({ clientId: dummyClientId });
    expect(ctx.db.client.findUniqueOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: dummyClientId } })
    );
    expect(result).toEqual(fullClientRecord);
  });

  it("should allow Manager role", async () => {
    ctx.session.user.role = "Manager";
    ctx.db.client.findUniqueOrThrow.mockResolvedValue(fullClientRecord);
    const caller = callClient(ctx);
    const result = await caller.getById({ clientId: dummyClientId });
    expect(result).toEqual(fullClientRecord);
  });

  it("should return client details for matching Client role", async () => {
    ctx.session.user.role = "Client";
    ctx.db.contact.findUnique.mockResolvedValue({ clientId: dummyClientId });
    ctx.db.client.findUniqueOrThrow.mockResolvedValue(fullClientRecord);
    const caller = callClient(ctx);
    const result = await caller.getById({ clientId: dummyClientId });
    expect(ctx.db.contact.findUnique).toHaveBeenCalledWith({
      where: { portalUserId: ctx.session.user.id },
    });
    expect(result).toEqual(fullClientRecord);
  });

  it("should forbid Client role with different clientId", async () => {
    ctx.session.user.role = "Client";
    ctx.db.contact.findUnique.mockResolvedValue({ clientId: "otherId" });
    const caller = callClient(ctx);
    await expect(
      caller.getById({ clientId: dummyClientId })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("should forbid Client role with no associated contact", async () => {
    ctx.session.user.role = "Client";
    ctx.db.contact.findUnique.mockResolvedValue(null);
    const caller = callClient(ctx);
    await expect(
      caller.getById({ clientId: dummyClientId })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("should forbid unauthorized roles", async () => {
    ctx.session.user.role = "Unknown";
    const caller = callClient(ctx);
    await expect(
      caller.getById({ clientId: dummyClientId })
    ).rejects.toBeInstanceOf(TRPCError);
  });
});
