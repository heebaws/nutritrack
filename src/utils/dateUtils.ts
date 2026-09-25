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

export const isFutureDate = (dateStr: string): boolean => {
  return dateStr > getTodayString();
};

export const clampToToday = (dateStr: string): string => {
  const today = getTodayString();
  return dateStr > today ? today : dateStr;
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
