import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../prisma/db";
import { AuthProvider } from "../prisma/enums";
import { buildAuthResponse } from "../utils/auth";

export async function signUpHandler(req: Request, res: Response) {
    try {
        const { name, email, password, imageUrl } = req.body;
        if(!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required.",
            });
        }

        const existingUser = await db.orm.public.User.where({ email }).first();

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists.",
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await db.orm.public.User.create({
            name,
            email,
            password: hashedPassword,
            provider: AuthProvider.CREDENTIALS,
            imageUrl: imageUrl || null,
        });
        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            data: buildAuthResponse(user),
        });
    } catch (error) {
        console.error("Error during sign-up:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during sign-up.",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

export async function signInHandler(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        if(!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const user = await db.orm.public.User.where({ email }).first();

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email.",
            });
        }

        if (user.provider === "GOOGLE") {
            return res.status(401).json({
                success: false,
                message: "This account uses Google sign-in. Continue with Google instead of a password.",
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required for credential-based accounts.",
            });
        }

        if (!user.password) {
            return res.status(500).json({
                success: false,
                message: "This account is missing a password hash.",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid password.",
            });
        }
        return res.status(200).json({
            success: true,
            message: "User signed in successfully.",
            data: buildAuthResponse(user),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred during sign-in.",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

export async function signOutHandler(req: Request, res: Response) {
    try {
        return res.status(200).json({
            success: true,
            message: "User signed out successfully.",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred during sign-out.",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

export async function googleAuthHandler(req: Request, res: Response) {
    try {
        const { name, email, imageUrl } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const existingUser = await db.orm.public.User.where({ email }).first();

        if (existingUser) {
            const updatedUser = await db.orm.public.User.where({ email }).update({
                name: name ?? existingUser.name,
                provider: AuthProvider.GOOGLE,
                imageUrl: imageUrl ?? existingUser.imageUrl,
                password: existingUser.password ?? null,
                updatedAt: new Date().toISOString(),
            });

            if (!updatedUser) {
                return res.status(404).json({ success: false, message: "User no longer exists." });
            }

            return res.status(200).json({
                success: true,
                message: "Google account confirmed successfully.",
                data: buildAuthResponse(updatedUser),
            });
        }

        const user = await db.orm.public.User.create({
            name: name ?? null,
            email,
            provider: AuthProvider.GOOGLE,
            imageUrl: imageUrl ?? null,
            password: null,
        });

        return res.status(201).json({
            success: true,
            message: "Google account created successfully.",
            data: buildAuthResponse(user),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while confirming Google sign-in.",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
