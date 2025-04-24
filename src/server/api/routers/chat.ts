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
        // Include members in the chat list to determine participant names
        const path =
          input === undefined
            ? `${basePath}?$expand=members`
            : `${basePath}?$expand=members&$top=${take}&$skip=${skip}`;
        const response = await graphClient.get<{
          value: Array<{
            id: string;
            chatType: string;
            topic?: string;
            lastUpdatedDateTime?: string;
            members?: Array<{ user: { id: string; displayName: string } }>;
          }>;
        }>(path);
        const chats = response.value.map((chat) => {
          let topic: string;
          let participantId: string | undefined;
          if (chat.chatType === "oneOnOne") {
            // For one-on-one chats, use the other participant's name
            const other = chat.members?.find((m) => m.user.id !== userId);
            topic = other?.user.displayName ?? "Chat";
            participantId = other?.user.id;
          } else {
            topic = chat.topic ?? "Chat";
          }
          return {
            id: chat.id,
            topic,
            lastUpdatedDateTime: chat.lastUpdatedDateTime ?? "",
            participantId,
          };
        });
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
      } catch (error) {
        console.error("[chatRouter.getMessages] GraphClient error:", error);
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
      } catch (error) {
        console.error("[chatRouter.findUsers] GraphClient error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to find users",
        });
      }
    }),

  createOneToOne: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const graphClient = new GraphClient();
      const initiatorId = ctx.session.user.id;
      try {
        const chat = await graphClient.post<{ id: string }>(`/chats`, {
          chatType: "oneOnOne",
          members: [
            // Initiator
            {
              "@odata.type": "#microsoft.graph.aadUserConversationMember",
              roles: ["owner"],
              "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${initiatorId}`,
            },
            // Other participant
            {
              "@odata.type": "#microsoft.graph.aadUserConversationMember",
              roles: ["owner"],
              "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${input.userId}`,
            },
          ],
        });
        return { id: chat.id };
      } catch (error) {
        console.error("[chatRouter.createOneToOne] GraphClient error:", error);
        // Disable explicit any for error object cast
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        const errorMessage = String(err.message || "");
        const errorBody = String(err.body || "");
        if (
          errorMessage === "AclCheckFailed" ||
          errorBody.includes("RosterCreationNotAllowed")
        ) {
          try {
            // List existing one-on-one chats for initiator
            const listPath = `/users/${initiatorId}/chats?$filter=chatType eq 'oneOnOne'&$expand=members&$top=50`;
            const list = await graphClient.get<{
              value: Array<{
                id: string;
                members: Array<{ user: { id: string } }>;
              }>;
            }>(listPath);
            const existing = list.value.find((c) =>
              c.members.some((m) => m.user.id === input.userId)
            );
            if (existing) {
              return { id: existing.id };
            }
          } catch (fallbackError) {
            console.error(
              "[chatRouter.createOneToOne] fallback error:",
              fallbackError
            );
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create or retrieve one-to-one chat",
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

  // Fetch all team members in the @qaspecialists.com.au domain
  listTeamMembers: protectedProcedure.query(async () => {
    try {
      const graphClient = new GraphClient();
      // Advanced query requires $count=true and ConsistencyLevel header
      const path =
        "/users?$count=true&$filter=endswith(mail,'@qaspecialists.com.au')&$top=999";
      const response = await graphClient.get<{
        value: Array<{ id: string; displayName: string; mail: string }>;
      }>(path);
      return response.value.map((user) => ({
        id: user.id,
        name: user.displayName,
        email: user.mail,
      }));
    } catch (error) {
      console.error("[chatRouter.listTeamMembers] GraphClient error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list team members",
      });
    }
  }),
});
