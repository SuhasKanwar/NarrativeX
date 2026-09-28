import type { Request, Response } from "express";
import { db } from "../prisma/db";
import { ChatType, Sender } from "../prisma/enums";
import { aiService } from "../services/aiService";
import { parseConversationId, parseUserId } from "../utils/ids";

export async function getChatHandler(req: Request, res: Response) {
    try {
        const userId = parseUserId(req.userId);
        const conversationId = parseConversationId(req.params.conversationId);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized access." });
        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "Conversation ID is required.",
            });
        }
        const conversation = await db.orm.public.Conversation
            .where({ id: conversationId, userId })
            .first();
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            });
        }
        const messages = await db.orm.public.Chat
            .where({ conversationId })
            .orderBy((chat) => chat.createdAt.asc())
            .all();

        return res.status(200).json({
            success: true,
            message: "Messages fetched successfully",
            data: messages,
        });
    } catch (error) {
        console.error("Error getting chat:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while getting the chat.",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

export async function postChatHandler(req: Request, res: Response) {
    try {
        const userId = parseUserId(req.userId);
        const conversationId = parseConversationId(req.params.conversationId);
        const { content } = req.body;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized access." });

        if (!conversationId) {
            return res.status(400).json({ success: false, message: "Conversation ID is required." });
        }
        if (typeof content !== "string" || !content.trim() || content.length > 2000) {
            return res.status(400).json({ success: false, message: "Content is required." });
        }

        const conversation = await db.orm.public.Conversation
            .where({ id: conversationId, userId })
            .first();

        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }

        const prevChats = await db.orm.public.Chat
            .where({ conversationId })
            .orderBy((chat) => chat.createdAt.asc())
            .all();

        const formattedHistory = prevChats.map(chat => ({
            role: chat.sender === 'user' ? 'user' : 'assistant',
            content: chat.content || ""
        }));

        const userChat = await db.orm.public.Chat.create({
            conversationId,
            sender: Sender.user,
            content,
            type: ChatType.text,
        });

        let completed = true;
        let botText: string;
        try {
            const aiResponse = await aiService.post('/api/agent/query', {
                query: content,
                session_history: formattedHistory,
                access_token: req.headers.authorization?.split(" ")[1]
            });
            botText = aiResponse?.data?.response || "No research brief was returned.";
        } catch (error) {
            completed = false;
            console.error("Research service failed after saving the user message:", error);
            botText = [
                "# Research could not be completed",
                "",
                "The source collection or evaluation service did not finish, so no evidence-based conclusion was generated.",
                "Please retry this question. Your original question has been preserved in this investigation.",
            ].join("\n");
        }

        const botChat = await db.orm.public.Chat.create({
            conversationId,
            sender: Sender.bot,
            content: botText,
            type: ChatType.text,
        });

        await db.orm.public.Conversation
            .where({ id: conversationId })
            .update({ lastUpdated: new Date().toISOString() });

        return res.status(201).json({
            success: completed,
            message: completed
                ? "Research brief generated successfully."
                : "Research was interrupted. A retry note was saved.",
            data: [userChat, botChat]
        });
    } catch (error) {
        console.error("Error creating chat:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the chat.",
            error: error instanceof Error ? error.message : String(error),
        });
    }
}
