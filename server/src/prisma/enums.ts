export const AuthProvider = {
  GOOGLE: "GOOGLE",
  CREDENTIALS: "CREDENTIALS",
} as const;

export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];

export const Sender = {
  user: "user",
  bot: "bot",
  system: "system",
} as const;

export type Sender = (typeof Sender)[keyof typeof Sender];

export const ChatType = {
  text: "text",
} as const;

export type ChatType = (typeof ChatType)[keyof typeof ChatType];

export const ConversationVariant = {
  chat: "chat",
} as const;

export type ConversationVariant = (typeof ConversationVariant)[keyof typeof ConversationVariant];
