import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   */
  async create(registerDto: RegisterDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = this.userRepository.create(registerDto);
    return this.userRepository.save(user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Update user profile
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Update user fields
    if (updateUserDto.firstName) {
      user.firstName = updateUserDto.firstName;
    }
    if (updateUserDto.lastName) {
      user.lastName = updateUserDto.lastName;
    }
    if (updateUserDto.avatarUrl !== undefined) {
      user.avatarUrl = updateUserDto.avatarUrl;
    }

    return this.userRepository.save(user);
  }

  /**
   * Change user password
   */
  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'avatarUrl', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate current password
    const isPasswordValid = await user.validatePassword(
      changePasswordDto.currentPassword,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Ensure new password is different from current password
    const isSamePassword = await user.validatePassword(
      changePasswordDto.newPassword,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Update password (will be hashed by BeforeUpdate hook)
    user.password = changePasswordDto.newPassword;
    await this.userRepository.save(user);
  }

  /**
   * Get user by ID without throwing error if not found
   */
  async findByIdOrNull(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}