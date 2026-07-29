import { FastifyRequest, FastifyReply } from "fastify";
import { ChatService } from "../services/chat.service";
import { prisma } from "../../../config/prisma";

export class ChatController {
    private chatService = new ChatService();

    chat = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { message, clusterId, sessionId, isBackground } = request.body as any;
            const user = (request as any).user;

            if (!user) {
                return reply.code(401).send({ message: "Unauthorized" });
            }

            if (!message) {
                return reply.code(400).send({ message: "Message is required" });
            }

            const response = await this.chatService.handleChat(user.id, clusterId, sessionId, message, isBackground);
            return reply.send(response);

        } catch (error: any) {
            request.log.error(error);
            return reply.code(500).send({ message: error.message || "An error occurred", stack: error.stack });
        }
    };

    getSessions = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const user = (request as any).user;
            if (!user) return reply.code(401).send({ message: "Unauthorized" });
            const clusterId = (request.query as any).clusterId;

            const sessions = await prisma.chatSession.findMany({
                where: { 
                    userId: user.id,
                    ...(clusterId ? { clusterId } : {})
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });

            return reply.send({ data: sessions });
        } catch (error: any) {
            request.log.error(error);
            return reply.code(500).send({ message: "Failed to fetch sessions" });
        }
    };

    deleteSession = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as any;
            const user = (request as any).user;
            if (!user) return reply.code(401).send({ message: "Unauthorized" });

            await prisma.chatSession.delete({
                where: { id, userId: user.id }
            });
            return reply.send({ success: true });
        } catch (error: any) {
            request.log.error(error);
            return reply.code(500).send({ message: "Failed to delete session" });
        }
    }
}
