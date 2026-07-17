import { FastifyReply, FastifyRequest } from "fastify";
import { DisconnectClusterService } from "../services/disconnect-cluster.service";

export class DisconnectClusterController {
    private disconnectClusterService: DisconnectClusterService;

    constructor() {
        this.disconnectClusterService = new DisconnectClusterService();
    }

    disconnect = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const { id } = request.params as { id: string };

            if (!id) {
                return reply.code(400).send({
                    success: false,
                    message: "Cluster ID is required"
                });
            }

            await this.disconnectClusterService.disconnect(id, userId);

            return reply.code(200).send({
                success: true,
                message: "Cluster disconnected successfully"
            });
        } catch (error: any) {
            if (error.message.includes("not found")) {
                return reply.code(404).send({
                    success: false,
                    message: error.message
                });
            }

            return reply.code(500).send({
                success: false,
                message: "Internal server error",
                error: error.message
            });
        }
    }
}
