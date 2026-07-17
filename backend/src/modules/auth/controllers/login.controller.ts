import { FastifyRequest, FastifyReply } from "fastify";
import { LoginService, LoginInput } from "../services/login.service";
import { RefreshTokenService } from "../services/refreshToken.service";


export class LoginController {

    private loginService: LoginService;
    private refreshTokenService: RefreshTokenService;

    constructor() {
        this.loginService = new LoginService();
        this.refreshTokenService = new RefreshTokenService();
    }

    login = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const UserData = request.body as LoginInput;
            const user = await this.loginService.loginUser(UserData);

            const token = await reply.jwtSign({
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            }, { expiresIn: '15m' })

            const refreshToken = await this.refreshTokenService.createRefreshToken(user.id);

            reply.setCookie('access_token', token, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60
            });

            reply.setCookie('refresh_token', refreshToken, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60
            });

            return reply.code(200).send({
                success: true,
                data: user,
                message: 'Login success',
                token: token
            })
        } catch (err: any) {
            return reply.code(400).send(err.message)
        }
    }

}