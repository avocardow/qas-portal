/* eslint-disable @typescript-eslint/no-explicit-any */

import { beforeEach, describe, it, expect, vi } from "vitest";
import { createCallerFactory } from "@/server/api/trpc";
import { documentRouter } from "./document";
import { TRPCError } from "@trpc/server";

describe("documentRouter", () => {
  let ctx: any;
  let callDoc: any;
  const validClientId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  const validAuditId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
  const validTaskId = "cccccccc-cccc-cccc-cccc-cccccccccccc";
  const validUserId = "dddddddd-dddd-dddd-dddd-dddddddddddd";

  beforeEach(() => {
    const db = {
      rolePermission: { findFirst: vi.fn() },
      documentReference: { findMany: vi.fn() },
      contact: { findUnique: vi.fn() },
      audit: { findUnique: vi.fn() },
      task: { findUnique: vi.fn() },
    } as any;
    ctx = {
      db,
      session: { user: { id: validUserId, role: "Admin" } },
      headers: new Headers(),
    };
    callDoc = createCallerFactory(documentRouter);
  });

  it("should retrieve documents by client id for Admin", async () => {
    ctx.db.rolePermission.findFirst.mockResolvedValue(true);
    const docs = [
      { id: validTaskId, fileName: "file1.pdf", sharepointFileUrl: "url1" },
    ];
    ctx.db.documentReference.findMany.mockResolvedValue(docs);
    const caller = callDoc(ctx);
    const result = await caller.getByClientId({ clientId: validClientId });
    expect(result).toEqual(docs);
    expect(ctx.db.documentReference.findMany).toHaveBeenCalledWith({
      where: { clientId: validClientId },
      select: { id: true, fileName: true, sharepointFileUrl: true },
      orderBy: { createdAt: "desc" },
    });
  });

  it("should forbid retrieval by client id without permission", async () => {
    ctx.session.user.role = "User";
    ctx.db.rolePermission.findFirst.mockResolvedValue(null);
    const caller = callDoc(ctx);
    await expect(
      caller.getByClientId({ clientId: validClientId })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("should retrieve documents by audit id for Admin", async () => {
    ctx.db.rolePermission.findFirst.mockResolvedValue(true);
    const docs = [
      { id: validTaskId, fileName: "auditDoc.pdf", sharepointFileUrl: "url2" },
    ];
    ctx.db.audit.findUnique.mockResolvedValue({
      id: validAuditId,
      clientId: validClientId,
    });
    ctx.db.documentReference.findMany.mockResolvedValue(docs);
    const caller = callDoc(ctx);
    const result = await caller.getByAuditId({ auditId: validAuditId });
    expect(result).toEqual(docs);
    expect(ctx.db.documentReference.findMany).toHaveBeenCalledWith({
      where: { auditId: validAuditId },
      select: { id: true, fileName: true, sharepointFileUrl: true },
      orderBy: { createdAt: "desc" },
    });
  });

  it("should forbid retrieval by audit id without permission", async () => {
    ctx.session.user.role = "User";
    ctx.db.rolePermission.findFirst.mockResolvedValue(null);
    const caller = callDoc(ctx);
    await expect(
      caller.getByAuditId({ auditId: validAuditId })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("should retrieve documents by task id for Admin", async () => {
    ctx.db.rolePermission.findFirst.mockResolvedValue(true);
    const docs = [
      { id: validTaskId, fileName: "taskDoc.pdf", sharepointFileUrl: "url3" },
    ];
    ctx.db.task.findUnique.mockResolvedValue({
      id: validTaskId,
      auditId: validAuditId,
    });
    ctx.db.documentReference.findMany.mockResolvedValue(docs);
    const caller = callDoc(ctx);
    const result = await caller.getByTaskId({ taskId: validTaskId });
    expect(result).toEqual(docs);
    expect(ctx.db.documentReference.findMany).toHaveBeenCalledWith({
      where: { taskId: validTaskId },
      select: { id: true, fileName: true, sharepointFileUrl: true },
      orderBy: { createdAt: "desc" },
    });
  });

  it("should forbid retrieval by task id without permission", async () => {
    ctx.session.user.role = "User";
    ctx.db.rolePermission.findFirst.mockResolvedValue(null);
    const caller = callDoc(ctx);
    await expect(
      caller.getByTaskId({ taskId: validTaskId })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("should retrieve shared documents for Client role", async () => {
    ctx.session.user.role = "Client";
    ctx.db.rolePermission.findFirst.mockResolvedValue(true);
    ctx.db.contact.findUnique.mockResolvedValue({
      portalUserId: validUserId,
      clientId: validClientId,
    });
    const docs = [
      { id: validTaskId, fileName: "clientDoc.pdf", sharepointFileUrl: "url4" },
    ];
    ctx.db.documentReference.findMany.mockResolvedValue(docs);
    const caller = callDoc(ctx);
    const result = await caller.getByClientId({ clientId: validClientId });
    expect(ctx.db.contact.findUnique).toHaveBeenCalledWith({
      where: { portalUserId: validUserId },
    });
    expect(ctx.db.documentReference.findMany).toHaveBeenCalledWith({
      where: { clientId: validClientId, isSharedWithClient: true },
      select: { id: true, fileName: true, sharepointFileUrl: true },
      orderBy: { createdAt: "desc" },
    });
    expect(result).toEqual(docs);
  });
});
