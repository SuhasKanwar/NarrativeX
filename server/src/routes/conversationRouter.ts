import { Router } from "express";
import { deleteConversationHandler, getConversationHandler, postConversationHandler, renameConversationHandler } from "../controllers/conversationController";
import { getChatHandler, postChatHandler } from "../controllers/chatController";

const conversationRouter = Router();

conversationRouter.get("/", getConversationHandler);
conversationRouter.post("/", postConversationHandler);
conversationRouter.delete("/:conversationId", deleteConversationHandler);
conversationRouter.put("/rename/:conversationId", renameConversationHandler);

conversationRouter.get("/chat/:conversationId", getChatHandler);
conversationRouter.post("/chat/:conversationId", postChatHandler);

export default conversationRouter;