import { FastifyReply, FastifyRequest } from "fastify";

export class connectCluster {

    connect = async (request: FastifyRequest, reply: FastifyReply) => {
        try {


        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message
            })
        }
    }

}
