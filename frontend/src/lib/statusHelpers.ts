export type ActStatus =
  | 'Obowiązuje'
  | 'Oczekuje'
  | 'W trakcie głosowania'
  | 'Nieznany';

export interface StatusInfo {
  name: ActStatus;
  isActive: boolean;
}

// All possible statuses - easy to add/remove
export const ALL_STATUSES: ActStatus[] = [
  'W trakcie głosowania',
  'Oczekuje',
  'Obowiązuje',
];

/**
 * Determines the current status of a legal act based on its dates
 * @param announcementDate - When the act was announced
 * @param promulgationDate - When the act comes into force
 * @returns The current status of the act
 */
export function getActStatus(
  announcementDate?: string | null,
  promulgationDate?: string | null
): ActStatus {
  if (!promulgationDate) {
    return 'Nieznany';
  }

  const now = new Date();
  const promulgation = new Date(promulgationDate);

  // If promulgation date is in the future, act is pending
  if (promulgation > now) {
    return 'Oczekuje';
  }

  // If promulgation date has passed, act is in force
  return 'Obowiązuje';
}

/**
 * Gets all statuses with their active state
 * @param currentStatus - The current active status
 * @returns Array of all statuses with isActive flag
 */
export function getAllStatusesWithActive(
  currentStatus: ActStatus
): StatusInfo[] {
  return ALL_STATUSES.map(status => ({
    name: status,
    isActive: status === currentStatus,
  }));
}

/**
 * Gets color classes for status badge
 * @param status - The status to get colors for
 * @returns Tailwind classes for the status
 */
export function getStatusColor(status: ActStatus): string {
  switch (status) {
    case 'Obowiązuje':
      return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50';
    case 'Oczekuje':
      return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50';
    case 'W trakcie głosowania':
      return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/50';
    default:
      return 'bg-neutral-500/20 text-neutral-700 dark:text-neutral-400 border-neutral-500/50';
  }
}
