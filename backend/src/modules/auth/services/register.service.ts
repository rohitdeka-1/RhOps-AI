import { AuthRepository } from '../repositories/auth.repository';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

export class RegisterService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async registerUser(data: Prisma.UserCreateInput) {
    const existingUser = await this.authRepository.findUsernameOrEmail(data.email, data.username);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.authRepository.createUser({
      ...data,
      password: hashedPassword,
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

}
