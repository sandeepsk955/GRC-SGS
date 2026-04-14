import { CheckCircle, Clock, AlertCircle, PlayCircle } from 'lucide-react';

export const STATUS_CONFIG = {
  completed: {
    label: 'Completed',
    color: 'green',
    bgClass: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  'in-progress': {
    label: 'In Progress',
    color: 'blue',
    bgClass: 'bg-blue-100 text-blue-800',
    icon: PlayCircle,
  },
  pending: {
    label: 'Pending',
    color: 'yellow',
    bgClass: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  overdue: {
    label: 'Overdue',
    color: 'red',
    bgClass: 'bg-red-100 text-red-800',
    icon: AlertCircle,
  },
};

export type StatusKey = keyof typeof STATUS_CONFIG;

/**
 * Maps numeric workflow status IDs from the database to internal status keys.
 * IDs based on GRC DashBoardService.cs logic:
 * 0, 1, 2 -> Not Started (Pending)
 * 3, 4, 5, 7 -> WIP (In Progress)
 * 6 -> Completed
 */
export const mapWorkflowStatus = (id: number | string | undefined | null): StatusKey => {
  const numericId = Number(id);
  if (numericId === 6) return 'completed';
  if ([3, 4, 5, 7].includes(numericId)) return 'in-progress';
  if ([0, 1, 2].includes(numericId)) return 'pending';
  return 'pending'; // Default fallback
};
