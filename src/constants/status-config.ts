export const STATUS_CONFIG: Record<string, Record<string, { color: string; label: string }>> = {
  employee: {
    active: { color: '#22c55e', label: 'Active' },
    inactive: { color: '#ef4444', label: 'Inactive' },
  },
  job: {
    pending: { color: '#f59e0b', label: 'Pending' },
    'in-progress': { color: '#3b82f6', label: 'In Progress' },
    completed: { color: '#22c55e', label: 'Completed' },
    cancelled: { color: '#ef4444', label: 'Cancelled' },
    upcoming: { color: '#3b82f6', label: 'Upcoming' },
    overdue: { color: '#ef4444', label: 'Overdue' },
  },
  parentJob: {
    active: { color: '#22c55e', label: 'Active' },
    inactive: { color: '#ef4444', label: 'Inactive' },
  },
  invoice: {
    paid: { color: '#22c55e', label: 'Paid' },
    pending: { color: '#f59e0b', label: 'Pending' },
    overdue: { color: '#ef4444', label: 'Overdue' },
    completed: { color: '#22c55e', label: 'Completed' },
  },
  customer: {
    active: { color: '#22c55e', label: 'Active' },
    inactive: { color: '#ef4444', label: 'Inactive' },
    expired: { color: '#f59e0b', label: 'Expired' },
  },
} as const;
