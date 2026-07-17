import { FastifyRequest, FastifyReply } from "fastify"
import { RefreshTokenService } from "../services/refreshToken.service";

export class LogoutController {
    private refreshTokenService: RefreshTokenService;

    constructor() {
        this.refreshTokenService = new RefreshTokenService();
    }

    logout = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const tokenStr = request.cookies.refresh_token;
            if (tokenStr) {
                try {
                    const user = await this.refreshTokenService.validateRefreshToken(tokenStr);
                    await this.refreshTokenService.deleteRefreshToken(user.id);
                } catch (e) {
                    // Ignore if token is already invalid
                }
            }

            reply.clearCookie('access_token');
            reply.clearCookie('refresh_token');
            
            return reply.code(200).send({
                success: true,
                message: 'Logout success'
            })
        } catch (err: any) {
            return reply.code(500).send({ message: err.message })
        }
    }

}