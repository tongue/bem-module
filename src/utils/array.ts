/**
 * Add unique item to an array
 * @param arr the array you want to add a value to
 * @param value the value you want to add
 * @returns a new array with a possible new value
 */
export const addUniqueToArray = <Type = unknown>(
  arr: Type[],
  value: Type
): Type[] => (arr.includes(value) ? arr : [...arr, value]);
