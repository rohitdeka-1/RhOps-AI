import { FastifyRequest, FastifyReply } from "fastify";
import { MeService } from "../services/me.service";

export class MeController {

    private meService: MeService;

    constructor() {
        this.meService = new MeService();
    }

    me = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const user = await this.meService.getMe(userId);

            return reply.code(200).send({
                success: true,
                data: user
            });
        } catch (err: any) {
            request.log.error(err);
            return reply.code(500).send({
                success: false,
                message: err.message
            });
        }
    }

}