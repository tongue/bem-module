/** Checks if value is not `null` or `undefined`
 * @param value the value you wan't to check
 * @returns `true` if value is not `null` or `undefined`
 */
export const notEmpty = <TValue>(
  value: TValue | null | undefined
): value is TValue => value !== null && value !== undefined;
