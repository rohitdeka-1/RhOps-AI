import { FastifyRequest, FastifyReply } from "fastify";
import { LoginService, LoginInput } from "../services/login.service";


export class LoginController {

    private loginService: LoginService;
    constructor() {
        this.loginService = new LoginService;
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
            })

            reply.setCookie('access_token', token, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24
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