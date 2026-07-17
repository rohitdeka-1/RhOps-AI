import { Prisma } from "@prisma/client";
import { AuthRepository } from "../repositories/auth.repository";

export class MeService {
    private authRepository: AuthRepository;

    constructor() {
        this.authRepository = new AuthRepository
    }

    async getMe(userId: string) {
        const user = await this.authRepository.findUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

}