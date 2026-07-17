import { AuthRepository } from '../repositories/auth.repository';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async registerUser(data: Prisma.UserCreateInput) {
    const existingUser = await this.authRepository.findUserByEmail(data.email);
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
