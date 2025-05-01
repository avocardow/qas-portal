/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createCallerFactory } from "@/server/api/trpc";
import { taskRouter } from "./task";
import { TRPCError } from "@trpc/server";

describe("taskRouter", () => {
  let ctx: any;
  let callTask: any;
  const validAuditId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  const validTaskId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
  const validUserId = "cccccccc-cccc-cccc-cccc-cccccccccccc";
  const inputTask = {
    auditId: validAuditId,
    name: "Test Task",
    description: "desc",
    assignedUserId: validUserId,
    dueDate: new Date(),
    priority: "High",
    requiresClientAction: false,
  };

  beforeEach(() => {
    const db = {
      task: {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    } as any;
    ctx = {
      db,
      session: { user: { id: validUserId, role: "Admin" } },
      headers: new Headers(),
    };
    callTask = createCallerFactory(taskRouter);
  });

  it("should create a task with proper permissions", async () => {
    ctx.db.task.create.mockResolvedValue({ id: validTaskId, ...inputTask });
    const caller = callTask(ctx);
    const result = await caller.create(inputTask);
    expect(result).toEqual({ id: validTaskId, ...inputTask });
    expect(ctx.db.task.create).toHaveBeenCalledWith({ data: inputTask });
  });

  it("should update a task with proper permissions", async () => {
    const updateInput = { taskId: validTaskId, ...inputTask, status: "Done" };
    ctx.db.task.update.mockResolvedValue({ id: validTaskId, ...updateInput });
    const caller = callTask(ctx);
    const result = await caller.update(updateInput);
    expect(result).toEqual({ id: validTaskId, ...updateInput });
    expect(ctx.db.task.update).toHaveBeenCalledWith({
      where: { id: validTaskId },
      data: {
        auditId: validAuditId,
        name: "Test Task",
        description: "desc",
        assignedUserId: validUserId,
        dueDate: inputTask.dueDate,
        priority: "High",
        requiresClientAction: false,
        status: "Done",
      },
    });
  });

  it("should forbid creation without proper permissions", async () => {
    ctx.session.user.role = "User";
    const caller = callTask(ctx);
    await expect(caller.create(inputTask)).rejects.toBeInstanceOf(TRPCError);
  });

  it("should forbid update without proper permissions", async () => {
    ctx.session.user.role = "User";
    const caller = callTask(ctx);
    await expect(
      caller.update({ taskId: validTaskId, ...inputTask })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("should delete a task with proper permissions", async () => {
    ctx.db.task.delete.mockResolvedValue({ id: validTaskId, ...inputTask });
    const caller = callTask(ctx);
    const result = await caller.delete({ taskId: validTaskId });
    expect(result).toEqual({ id: validTaskId, ...inputTask });
    expect(ctx.db.task.delete).toHaveBeenCalledWith({
      where: { id: validTaskId },
    });
  });

  it("should forbid deletion without proper permissions", async () => {
    ctx.session.user.role = "User";
    const caller = callTask(ctx);
    await expect(caller.delete({ taskId: validTaskId })).rejects.toBeInstanceOf(
      TRPCError
    );
  });
});
