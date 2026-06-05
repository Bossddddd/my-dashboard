export const matchesSearchText = (query: string, ...values: any[]) => {
  return values.some((value) => String(value ?? "").toLowerCase().includes(query));
};

export const sortedArray = (array: any[], field: string, direction: 'asc' | 'desc') => {
  if (!field || !array) return array;
  return [...array].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];
    if (aVal == null) aVal = "";
    if (bVal == null) bVal = "";
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return direction === 'asc' ? (aVal > bVal ? 1 : -1) : (bVal > aVal ? 1 : -1);
  });
};
