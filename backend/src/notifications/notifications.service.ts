import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async create(data: Partial<Notification>) {
    return this.notificationRepo.save(this.notificationRepo.create(data));
  }

  findMine(recipientMatricule: string) {
    return this.notificationRepo.find({
      where: { recipientMatricule },
      order: { createdAt: 'DESC' },
    });
  }

  async markRead(id: string, recipientMatricule: string) {
    await this.notificationRepo.update(
      { id, recipientMatricule },
      { isRead: true },
    );
    return { success: true };
  }

  async respond(
    id: string,
    recipientMatricule: string,
    status: 'APPROVED' | 'REJECTED',
  ) {
    const notification = await this.notificationRepo.findOne({
      where: { id, recipientMatricule },
    });
    if (!notification) return null;
    notification.status = status;
    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }
}
