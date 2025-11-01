// Format currency according to locale
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
  }).format(amount);
};

// Format distance in kilometers
export const formatDistance = (distance: number): string => {
  return `${distance.toFixed(1)} km`;
};

// Format duration in minutes to human-readable format
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
};

// Format date relative to now (e.g., "2 hours ago", "in 3 days")
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = then.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (Math.abs(diffMins) < 60) {
    return diffMins >= 0 
      ? `in ${diffMins} minutes`
      : `${Math.abs(diffMins)} minutes ago`;
  }

  if (Math.abs(diffHours) < 24) {
    return diffHours >= 0
      ? `in ${diffHours} hours`
      : `${Math.abs(diffHours)} hours ago`;
  }

  return diffDays >= 0
    ? `in ${diffDays} days`
    : `${Math.abs(diffDays)} days ago`;
};