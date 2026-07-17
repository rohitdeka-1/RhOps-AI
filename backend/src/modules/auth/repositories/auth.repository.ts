import { prisma } from '../../../config/prisma';
import { Prisma } from '@prisma/client';

export class AuthRepository {
  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }
}
