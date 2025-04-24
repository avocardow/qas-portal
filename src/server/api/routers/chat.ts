import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { GraphClient } from "@/server/utils/graphClient";
import { TRPCError } from "@trpc/server";

export const chatRouter = createTRPCRouter({
  listRecent: protectedProcedure
    .input(
      z
        .object({ skip: z.number().optional(), take: z.number().optional() })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const skip = input?.skip ?? 0;
      const take = input?.take ?? 20;
      // Use authenticated user's chats
      const userId = ctx.session.user.id;
      const basePath = `/users/${userId}/chats`;
      try {
        const graphClient = new GraphClient();
        const path =
          input === undefined
            ? basePath
            : `${basePath}?$top=${take}&$skip=${skip}`;
        const response = await graphClient.get<{
          value: Array<{
            id: string;
            topic?: string;
            lastUpdatedDateTime?: string;
          }>;
        }>(path);
        const chats = response.value.map((chat) => ({
          id: chat.id,
          topic: chat.topic ?? "Chat",
          lastUpdatedDateTime: chat.lastUpdatedDateTime ?? "",
        }));
        if (input === undefined) {
          return chats;
        }
        const nextSkip = response.value.length === take ? skip + take : null;
        return { chats, nextSkip };
      } catch (error) {
        // Log full error for debugging
        console.error("[chatRouter.listRecent] GraphClient error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list recent chats",
        });
      }
    }),

  getMessages: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ input }) => {
      try {
        const graphClient = new GraphClient();
        const response = await graphClient.get<{
          value: Array<{
            id: string;
            from: { user: { id: string; displayName: string } };
            body: { content: string };
            createdDateTime: string;
          }>;
        }>(`/chats/${input.chatId}/messages`);
        return response.value.map((msg) => ({
          id: msg.id,
          content: msg.body.content,
          from: { id: msg.from.user.id, name: msg.from.user.displayName },
          createdDateTime: msg.createdDateTime,
        }));
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get messages",
        });
      }
    }),

  sendMessage: protectedProcedure
    .input(z.object({ chatId: z.string(), content: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const graphClient = new GraphClient();
        const result = await graphClient.post<{ id: string }>(
          `/chats/${input.chatId}/messages`,
          {
            body: { content: input.content },
          }
        );
        return { id: result.id };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message",
        });
      }
    }),

  findUsers: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      try {
        const graphClient = new GraphClient();
        const filter = `startswith(displayName,'${input.query}') or startswith(mail,'${input.query}')`;
        const response = await graphClient.get<{
          value: Array<{ id: string; displayName: string; mail: string }>;
        }>(`/users?$filter=${encodeURIComponent(filter)}&$top=10`);
        return response.value.map((user) => ({
          id: user.id,
          name: user.displayName,
          email: user.mail,
        }));
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to find users",
        });
      }
    }),

  createOneToOne: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const graphClient = new GraphClient();
        const chat = await graphClient.post<{ id: string }>(`/chats`, {
          chatType: "oneOnOne",
          members: [
            {
              "@odata.type": "#microsoft.graph.aadUserConversationMember",
              roles: ["owner"],
              "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${input.userId}`,
            },
          ],
        });
        return { id: chat.id };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create one-to-one chat",
        });
      }
    }),

  createGroup: protectedProcedure
    .input(z.object({ userIds: z.array(z.string()), topic: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const graphClient = new GraphClient();
        const members = input.userIds.map((id) => ({
          "@odata.type": "#microsoft.graph.aadUserConversationMember",
          roles: ["owner"],
          "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${id}`,
        }));
        const chat = await graphClient.post<{ id: string }>(`/chats`, {
          chatType: "group",
          topic: input.topic,
          members,
        });
        return { id: chat.id };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create group chat",
        });
      }
    }),
});
