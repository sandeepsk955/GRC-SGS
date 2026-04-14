export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  type: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

export interface CompliancePeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'closed';
  domain: string;
  progress: number;
}

export interface License {
  id: string;
  standard: string;
  status: 'active' | 'expired' | 'pending';
  expiryDate: string;
  domain: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
}

export interface GovernanceDomain {
  id: string;
  name: string;
  description: string;
  icon: string;
  userId?: number;
}