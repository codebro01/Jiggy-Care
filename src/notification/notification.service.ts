import { BadRequestException, Injectable } from '@nestjs/common';
import { NotificationRepository } from '@src/notification/repository/notification.repository';
import { CreateNotificationDto } from '@src/notification/dto/createNotificationDto';
// import { notificationTableSelectType } from '@src/db/notifications';
import { FilterNotificationsDto } from './dto/filterNotificationDto';

@Injectable()
export class NotificationService {
  constructor(
    private notificationRepository: NotificationRepository,
  ) { }

  async createNotification(data: CreateNotificationDto, userId: string) {
    try {
      const notification = await this.notificationRepository.createNotification(
        data,
        userId,
      );

      return notification;
    } catch (error) {
      console.log(error)
      throw new BadRequestException('An error occured, please try again')
    }
  }

  async getNotifications(userId: string) {
    try {
      const notification =
        await this.notificationRepository.getNotifications(userId);

      return notification;
    } catch (error) {
      console.log(error)
      throw new BadRequestException('An error occured, please try again')

    }
  }

  async getNotification(notificationId: string, userId: string) {
    try {
      const notification = await this.notificationRepository.getNotification(
        notificationId,
        userId,
      );

      return notification;
    } catch (error) {
      console.log(error)
      throw new BadRequestException(error.message || 'An error occured, please try again')

    }
  }
  async updateNotifications(
    data: Pick<CreateNotificationDto, 'status'>,
    notificationId: string[],
    userId: string,
  ) {
    try {
      const notification =
        await this.notificationRepository.updateNotifications(
          data,
          notificationId,
          userId,
        );

      return notification;
    } catch (error) {
      throw new BadRequestException(error.message || 'An error occured, please try again')

    }
  }
  async updateNotification(
    data: Pick<CreateNotificationDto, 'status'>,
    notificationId: string,
    userId: string,
  ) {
    try {
      const notification = await this.notificationRepository.updateNotification(
        data,
        notificationId,
        userId,
      );

      return notification;
    } catch (error) {
      throw new BadRequestException(error.message || 'An error occured, please try again')

    }
  }
  async notificationDashboard(
    userId: string,
  ) {
    try {
      const data = await this.notificationRepository.notificationDashboard(

        userId,
      );

      return data;
    } catch (error) {
      throw new BadRequestException(error.message || 'An error occured, please try again')

    }
  }

  async filterNotifications(filters: FilterNotificationsDto, userId: string) {
    const data = await this.notificationRepository.filterNotifications(filters, userId);
    return data;
  }
}
