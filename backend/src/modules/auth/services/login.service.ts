import { AuthRepository } from "../repositories/auth.repository";
import * as bcrypt from 'bcrypt';

export interface LoginInput {
    email: string;
    password: string;
}

export class LoginService {
    private authRepository: AuthRepository;

    constructor() {
        this.authRepository = new AuthRepository;
    }

    async loginUser(data: LoginInput) {
        const { email, password } = data;
        const user = await this.authRepository.findUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        const access = await bcrypt.compare(password, user.password);
        if (!access) {
            throw new Error('Email or password incorrect');
        }
        return user;
    }

}