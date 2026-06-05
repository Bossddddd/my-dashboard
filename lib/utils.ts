export const matchesSearchText = (query: string, ...values: unknown[]) => {
  return values.some((value) => String(value ?? "").toLowerCase().includes(query));
};

export const sortedArray = <T,>(array: T[], field: keyof T | string, direction: 'asc' | 'desc'): T[] => {
  if (!field || !array) return array;
  return [...array].sort((a, b) => {
    let aVal = (a as Record<string, any>)[field as string];
    let bVal = (b as Record<string, any>)[field as string];
    if (aVal == null) aVal = "";
    if (bVal == null) bVal = "";
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return direction === 'asc' ? (aVal > bVal ? 1 : -1) : (bVal > aVal ? 1 : -1);
  });
};
