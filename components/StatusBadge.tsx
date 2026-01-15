
import React from 'react';
import { EndpointStatus } from '../types';

interface StatusBadgeProps {
  status: EndpointStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    [EndpointStatus.ONLINE]: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    [EndpointStatus.DEGRADED]: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    [EndpointStatus.OFFLINE]: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    [EndpointStatus.CHECKING]: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 animate-pulse',
  };

  const labels = {
    [EndpointStatus.ONLINE]: 'Operational',
    [EndpointStatus.DEGRADED]: 'Degraded',
    [EndpointStatus.OFFLINE]: 'Critical / Offline',
    [EndpointStatus.CHECKING]: 'Checking...',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};
