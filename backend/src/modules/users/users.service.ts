import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction } from '../activity/enums/activity-action.enum';
import { EntityType } from '../activity/enums/entity-type.enum';
import { buildUserMetadata } from '../activity/helpers/metadata-builder.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => ActivityService))
    private readonly activityService: ActivityService,
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

    // Track changes
    const changes: any = {};
    if (updateUserDto.firstName && updateUserDto.firstName !== user.firstName) {
      changes.firstName = { old: user.firstName, new: updateUserDto.firstName };
      user.firstName = updateUserDto.firstName;
    }
    if (updateUserDto.lastName && updateUserDto.lastName !== user.lastName) {
      changes.lastName = { old: user.lastName, new: updateUserDto.lastName };
      user.lastName = updateUserDto.lastName;
    }
    if (updateUserDto.avatarUrl !== undefined && updateUserDto.avatarUrl !== user.avatarUrl) {
      changes.avatarUrl = { old: user.avatarUrl, new: updateUserDto.avatarUrl };
      user.avatarUrl = updateUserDto.avatarUrl;
    }

    const updatedUser = await this.userRepository.save(user);

    // Log user update activity
    if (Object.keys(changes).length > 0) {
      try {
        await this.activityService.log({
          userId: user.id,
          action: ActivityAction.USER_UPDATE,
          entityType: EntityType.USER,
          entityId: user.id,
          metadata: buildUserMetadata(user, changes),
        });
      } catch (error) {
        console.error('Failed to log user update activity:', error);
      }
    }

    return updatedUser;
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

    // Log password change activity
    try {
      await this.activityService.log({
        userId: user.id,
        action: ActivityAction.PASSWORD_CHANGE,
        entityType: EntityType.USER,
        entityId: user.id,
        metadata: {
          email: user.email,
          changedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Failed to log password change activity:', error);
    }
  }

  /**
   * Get user by ID without throwing error if not found
   */
  async findByIdOrNull(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}