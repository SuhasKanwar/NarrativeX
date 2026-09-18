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
        if (!content) {
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

        const aiResponse = await aiService.post('/api/agent/query', {
            query: content,
            session_history: formattedHistory
        });

        const botText = aiResponse?.data?.response || "I'm sorry, I couldn't generate a response.";

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
            success: true,
            message: "Chat processed successfully",
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
