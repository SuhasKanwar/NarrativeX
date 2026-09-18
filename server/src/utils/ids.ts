import type { db } from "../prisma/db";

type UserId = Awaited<ReturnType<typeof db.orm.public.User.create>>["id"];
type ConversationId = Awaited<ReturnType<typeof db.orm.public.Conversation.create>>["id"];

export function parseUserId(value: unknown): UserId | null {
  return typeof value === "string" && value.length === 24 ? (value as UserId) : null;
}

export function parseConversationId(value: unknown): ConversationId | null {
  return typeof value === "string" && value.length === 36 ? (value as ConversationId) : null;
}

if (import.meta.main && (!parseUserId("x".repeat(24)) || !parseConversationId("x".repeat(36)))) {
  throw new Error("fixed-length ID parsing failed");
}
