import { FastifyRequest, FastifyReply } from "fastify"

export class LogoutController {

    logout = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await reply.clearCookie('access_token');
            return reply.code(200).send({
                success: true,
                message: 'Logout success'
            })
        } catch (err: any) {
            return reply.send(err.message)
        }
    }

}