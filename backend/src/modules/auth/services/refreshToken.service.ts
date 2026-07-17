import { prisma } from "../../../config/prisma";
import crypto from 'crypto';

export class RefreshTokenService {

    createRefreshToken = async (userId: string) => {
        const token = crypto.randomBytes(40).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        const refreshToken = await prisma.refreshToken.upsert({
            where: { userId: userId },
            update: {
                token,
                expiresAt,
            },
            create: {
                userId,
                token,
                expiresAt,
            }
        });

        return refreshToken.token;
    }

    validateRefreshToken = async (token: string) => {
        const refreshToken = await prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!refreshToken) {
            throw new Error('Invalid refresh token');
        }

        if (refreshToken.expiresAt < new Date()) {
            throw new Error('Refresh token expired');
        }

        return refreshToken.user;
    }

    deleteRefreshToken = async (userId: string) => {
        try {
            await prisma.refreshToken.delete({
                where: { userId }
            });
        } catch (error) {
            // Ignored: it might not exist if they are already logged out
        }
    }
}