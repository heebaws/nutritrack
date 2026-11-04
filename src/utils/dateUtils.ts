// Utility functions for reliable local date operations (prevents UTC timezone shift)

export const formatToLocalIsoDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayString = (): string => {
  return formatToLocalIsoDate(new Date());
};

export const getYesterdayString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatToLocalIsoDate(d);
};

export const getDaysAgoString = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatToLocalIsoDate(d);
};

export const getDayBeforeDateString = (dateStr: string): string => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() - 1);
    return formatToLocalIsoDate(dateObj);
  } catch {
    return getYesterdayString();
  }
};

export const isFutureDate = (dateStr: string): boolean => {
  return dateStr > getTodayString();
};

export const clampToToday = (dateStr: string): string => {
  const today = getTodayString();
  return dateStr > today ? today : dateStr;
};

/**
 * Calculates calendar days elapsed between a date string (YYYY-MM-DD) and today.
 */
export const getDaysSinceDate = (dateStr?: string | null): number => {
  if (!dateStr) return 999;
  try {
    const today = getTodayString();
    if (dateStr >= today) return 0;
    const [y1, m1, d1] = dateStr.split('-').map(Number);
    const [y2, m2, d2] = today.split('-').map(Number);
    const dt1 = new Date(y1, m1 - 1, d1);
    const dt2 = new Date(y2, m2 - 1, d2);
    const diffTime = dt2.getTime() - dt1.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch {
    return 999;
  }
};

/**
 * Client is considered inactive if they haven't updated food logs for 3 or more days.
 */
export const isClientInactiveThreeDays = (lastActiveDate?: string | null): boolean => {
  return getDaysSinceDate(lastActiveDate) >= 3;
};

export const formatDateDisplay = (dateStr: string): string => {
  const today = getTodayString();
  const yesterday = getYesterdayString();
  const twoDaysAgo = getDaysAgoString(2);

  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = dateObj.getDate();
    const yearNum = dateObj.getFullYear();
    const formatted = `${monthName} ${dayNum}, ${yearNum}`;

    if (dateStr === today) {
      return `Today, ${formatted}`;
    }
    if (dateStr === yesterday) {
      return `Yesterday, ${formatted}`;
    }
    if (dateStr === twoDaysAgo) {
      return `2 Days Ago, ${formatted}`;
    }
    return formatted;
  } catch {
    return dateStr;
  }
};
