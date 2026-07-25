import { FastifyInstance } from "fastify";
import { ChatController } from "../controllers/chat.controller";

export async function aiRoutes(fastify: FastifyInstance) {
    const chatController = new ChatController();

    fastify.post("/chat", { preValidation: [fastify.authenticate] }, chatController.chat);
    fastify.get("/sessions", { preValidation: [fastify.authenticate] }, chatController.getSessions);
    fastify.delete("/sessions/:id", { preValidation: [fastify.authenticate] }, chatController.deleteSession);
}
