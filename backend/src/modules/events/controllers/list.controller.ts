import { FastifyRequest, FastifyReply } from "fastify";
import { ListEventsService } from "../services/list.service";

export class ListEventsController {
    private listEventsService: ListEventsService;

    constructor() {
        this.listEventsService = new ListEventsService();
    }

    listEvents = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const events = await this.listEventsService.listEvents(clusterId, userId, namespace);
            return reply.code(200).send({ success: true, data: events, message: "Events retrieved successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
