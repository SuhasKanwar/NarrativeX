import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../lib/config.ts";
import type { AuthProvider } from "../prisma/enums.ts";

export function buildAuthResponse<T extends {
    id: string;
    name: string | null;
    email: string;
    imageUrl: string | null;
    provider: AuthProvider;
    createdAt: unknown;
    updatedAt: unknown;
}>(user: T) {
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            imageUrl: user.imageUrl,
            provider: user.provider,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        },
        token,
    };
}
