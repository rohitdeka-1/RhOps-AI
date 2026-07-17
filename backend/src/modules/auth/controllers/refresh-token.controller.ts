import { FastifyRequest, FastifyReply } from 'fastify';
import { RefreshTokenService } from '../services/refreshToken.service';

export class RefreshTokenController {
    private refreshTokenService: RefreshTokenService;

    constructor() {
        this.refreshTokenService = new RefreshTokenService();
    }

    refresh = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const tokenStr = request.cookies.refresh_token;
            if (!tokenStr) {
                return reply.code(401).send({ success: false, message: 'No refresh token provided' });
            }

            const user = await this.refreshTokenService.validateRefreshToken(tokenStr);

            const newAccessToken = await reply.jwtSign({
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            }, { expiresIn: '15m' });

            // Rotate refresh token
            const newRefreshToken = await this.refreshTokenService.createRefreshToken(user.id);

            reply.setCookie('access_token', newAccessToken, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60
            });

            reply.setCookie('refresh_token', newRefreshToken, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60
            });

            return reply.code(200).send({
                success: true,
                message: 'Token refreshed successfully'
            });

        } catch (error: any) {
            reply.clearCookie('access_token');
            reply.clearCookie('refresh_token');
            return reply.code(401).send({ success: false, message: error.message || 'Invalid or expired refresh token' });
        }
    }
}