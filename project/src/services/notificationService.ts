import { apiService, unwrapData } from './api';

export interface Notification {
  notificationId: number;
  activity: string;
  notificationType: string;
  assignmentId: number;
  assignmentStatus: string;
  notificationDate: string;
  plannedStartdate: string;
  helpRefDocs: string;
  plannedEndDate: string | null;
  duration: number | null;
}

export interface ActivityForReview {
  assignmentId: number;
  activityTitle: string;
  activity: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  plannedStartdate: string | null;
  doerComments: string;
  duration: number | null;
  plannedEndDate: string | null;
}

export const notificationService = {
  getNotifications: (customerId: number, userId: number, govId: number) =>
    unwrapData<Notification[]>(apiService.get(`/MyNotification`, {
      params: { CustomerId: customerId, UserId: userId, GovId: govId }
    })),

  getReviews: (customerId: number, userId: number, govId: number) =>
    unwrapData<ActivityForReview[]>(apiService.get(`/MyNotification/MyReviews`, {
      params: { CustomerId: customerId, UserId: userId, GovId: govId }
    }))
};
