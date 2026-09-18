export const AuthProvider = {
  GOOGLE: "GOOGLE",
  CREDENTIALS: "CREDENTIALS",
} as const;

export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];
