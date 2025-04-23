/* eslint-disable @typescript-eslint/no-explicit-any */

import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { createCallerFactory } from "@/server/api/trpc";
import { sharepointRouter } from "./sharepoint";
import { TRPCError } from "@trpc/server";
import { GraphClient } from "@/server/utils/graphClient";

describe("sharepointRouter", () => {
  let ctx: any;
  let callSharepoint: any;
  const dummyDriveId = "dummy-drive";

  beforeEach(() => {
    callSharepoint = createCallerFactory(sharepointRouter);
    ctx = { session: { user: { role: "Admin" } } } as any;
    process.env.SHAREPOINT_DRIVE_ID = dummyDriveId;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.SHAREPOINT_DRIVE_ID;
  });

  it("should list client folders for Admin/Manager", async () => {
    const folders = [{ id: "1", name: "Client A" }];
    vi.spyOn(GraphClient.prototype, "get").mockResolvedValue({
      value: folders,
    });
    const caller = callSharepoint(ctx);
    const result = await caller.listClientFolders();
    expect(result).toEqual(folders);
    expect(GraphClient.prototype.get).toHaveBeenCalledWith(
      `/drives/${dummyDriveId}/root:/Clients Folders:/children`
    );
  });

  it("should throw if driveId not configured in listClientFolders", async () => {
    delete process.env.SHAREPOINT_DRIVE_ID;
    const caller = callSharepoint(ctx);
    await expect(caller.listClientFolders()).rejects.toBeInstanceOf(TRPCError);
  });

  it("should retrieve folder contents for Admin/Manager", async () => {
    const items = [
      {
        id: "f1",
        name: "File1",
        webUrl: "url1",
        folder: {},
        lastModifiedDateTime: "2024-01-01T00:00:00Z",
      },
    ];
    vi.spyOn(GraphClient.prototype, "get").mockResolvedValue({ value: items });
    const caller = callSharepoint(ctx);
    const result = await caller.getFolderContents({ folderId: "f1" });
    expect(result).toEqual([
      {
        id: "f1",
        name: "File1",
        webUrl: "url1",
        isFolder: true,
        lastModifiedDateTime: "2024-01-01T00:00:00Z",
      },
    ]);
    expect(GraphClient.prototype.get).toHaveBeenCalledWith(
      `/drives/${dummyDriveId}/items/f1/children`
    );
  });

  it("should throw if driveId not configured in getFolderContents", async () => {
    delete process.env.SHAREPOINT_DRIVE_ID;
    const caller = callSharepoint(ctx);
    await expect(
      caller.getFolderContents({ folderId: "f1" })
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("should forbid non-Admin/Manager for listClientFolders", async () => {
    ctx.session.user.role = "Client";
    process.env.SHAREPOINT_DRIVE_ID = dummyDriveId;
    const caller = callSharepoint(ctx);
    await expect(caller.listClientFolders()).rejects.toBeInstanceOf(TRPCError);
  });

  it("should forbid non-Admin/Manager for getFolderContents", async () => {
    ctx.session.user.role = "Client";
    process.env.SHAREPOINT_DRIVE_ID = dummyDriveId;
    const caller = callSharepoint(ctx);
    await expect(
      caller.getFolderContents({ folderId: "f1" })
    ).rejects.toBeInstanceOf(TRPCError);
  });
});
