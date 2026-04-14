import { apiService, unwrapData } from './api';

export interface DashboardAssignment {
  assignmentId?: number;
  activityTitle: string;
  activityDetail: string;
  reviewer: string;
  doer: string;
  startDate?: string;
  workflowStatus: string;
  doerComments: string;
  reviewerComments: string;
  plannedEndDate: string;
  plannedStartDate?: string;
  actualEndDate?: string;
}

export const dashboardService = {
  // Global (Admin) Assignment Endpoints
  getAssignmentsNotStarted: (customerId: number) => 
    unwrapData<DashboardAssignment[]>(apiService.get(`/DashBoard/GetAssignmentsnotStarted?CustomerId=${customerId}`)),
    
  getAssignmentsDoerWip: (customerId: number) => 
    unwrapData<DashboardAssignment[]>(apiService.get(`/DashBoard/GetAssignmentsDoerWip?CustomerId=${customerId}`)),
    
  getAssignmentsReviewerWip: (customerId: number) => 
    unwrapData<DashboardAssignment[]>(apiService.get(`/DashBoard/GetAssignmentsReviewerWip?CustomerId=${customerId}`)),
    
  getAssignmentsCompleted: (customerId: number) => 
    unwrapData<DashboardAssignment[]>(apiService.get(`/DashBoard/GetAssignmentsCompleted?CustomerId=${customerId}`)),

  // User-Scoped Assignment Endpoints
  getAssignmentsNotStartedByUser: (customerId: number, userId: number) => 
    unwrapData<DashboardAssignment[]>(apiService.get(`/DashBoard/GetAssignmentsnotStartedByUser?CustomerId=${customerId}&UserId=${userId}`)),
    
  getAssignmentsDoerWipByUser: (customerId: number, userId: number) => 
    unwrapData<DashboardAssignment[]>(apiService.get(`/DashBoard/GetAssignmentsDoerWipByUserId?CustomerId=${customerId}&UserId=${userId}`)),
    
  getAssignmentsCompletedByUser: (customerId: number, userId: number) => 
    unwrapData<DashboardAssignment[]>(apiService.get(`/DashBoard/GetAssignmentsCompletedByUser?CustomerId=${customerId}&UserId=${userId}`)),

  getAssignmentsReviewerWipByUser: (customerId: number) => 
    unwrapData<DashboardAssignment[]>(apiService.get(`/DashBoard/GetAssignmentsReviewerWip?CustomerId=${customerId}`)),

  // Generic metrics fetchers for Stats
  getCompliancePeriods: (customerId: number, govId: number) =>
    unwrapData<any[]>(apiService.get(`/CompliancePeriod?CustomerId=${customerId}&GovId=${govId}`)),
};
