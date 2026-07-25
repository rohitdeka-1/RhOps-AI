import { FastifyInstance } from "fastify";
import { AiController } from "../controllers/ai.controller";

export async function aiRoutes(fastify: FastifyInstance) {
    const aiController = new AiController();

    fastify.post("/chat", { preValidation: [fastify.authenticate] }, aiController.chat);
    fastify.get("/sessions", { preValidation: [fastify.authenticate] }, aiController.getSessions);
    fastify.delete("/sessions/:id", { preValidation: [fastify.authenticate] }, aiController.deleteSession);
}
