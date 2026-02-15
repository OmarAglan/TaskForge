import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { WebSocketService } from '../websocket/websocket.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly websocketService: WebSocketService,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      message,
      data: data ?? null,
      read: false,
      readAt: null,
    });

    const saved = await this.notificationRepository.save(notification);

    // Emit in real-time (best-effort)
    try {
      this.websocketService.emitNotification(userId, {
        id: saved.id,
        userId: saved.userId,
        type: saved.type,
        title: saved.title,
        message: saved.message,
        data: saved.data ?? undefined,
        createdAt: saved.createdAt.toISOString(),
      });
    } catch (err) {
      this.logger.warn(`Failed to emit notification websocket event: ${saved.id}`);
    }

    return saved;
  }

  async findByUser(
    userId: string,
    unreadOnly?: boolean,
  ): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: unreadOnly ? { userId, read: false } : { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, read: false },
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You do not have access to this notification');
    }

    if (notification.read) {
      return notification;
    }

    notification.read = true;
    notification.readAt = new Date();

    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    const result = await this.notificationRepository.update(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );

    return { updated: result.affected ?? 0 };
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You do not have access to this notification');
    }

    await this.notificationRepository.remove(notification);
  }
}