import { notEmpty } from "./typeguards";

const SEPERATOR = {
  ELEMENT: "__",
  MODIFIER: "--",
  MODIFIER_VALUE: "-",
};

const MODIFIER_VALUE_REGEXP = /[A-Za-z]-[A-Za-z]/g;

/**
 * Checks if string has an element selector
 * @param str string
 * @returns `true` if the selector is a element class
 */
export const hasElement = (str: string): boolean =>
  str.includes(SEPERATOR.ELEMENT);

/**
 * Checks if string has an modifier selector
 * @param str string
 * @returns `true` if the selector is a modifier class
 */
export const hasModifier = (str: string): boolean =>
  str.includes(SEPERATOR.MODIFIER);

/**
 * Checks if string has a modifier value
 * @param str string
 * @returns boolean
 */
export const hasModifierValue = (str: string): boolean =>
  hasModifier(str) && notEmpty(str.match(MODIFIER_VALUE_REGEXP));

/**
 * Extracts the block name from a bem selector
 * @param selector bem css selector
 * @returns the block name
 */
export const extractBlockName = (selector: string): string => {
  if (hasElement(selector)) return selector.split(SEPERATOR.ELEMENT)[0];
  if (hasModifier) return selector.split(SEPERATOR.MODIFIER)[0];
  return selector;
};

/**
 * Extracts the element name from a bem selector
 * @param selector bem css selector
 * @returns the element name
 */
export const extractElementName = (selector: string): string => {
  if (hasModifier) {
    return selector.split(SEPERATOR.ELEMENT)[1].split(SEPERATOR.MODIFIER)[0];
  }
  return selector.split(SEPERATOR.ELEMENT)[1];
};

/**
 * Extracts the modifier name from a bem selector
 * @param selector bem css selector
 * @returns the modifier name
 */
export const extractModifierName = (selector: string | undefined): string => {
  if (notEmpty(selector)) {
    return hasModifierValue(selector)
      ? selector.split(SEPERATOR.MODIFIER)[1].split(SEPERATOR.MODIFIER_VALUE)[0]
      : selector.split(SEPERATOR.MODIFIER)[1];
  }
  return "";
};

/**
 * Extracts the modifier value from a bem selector
 * @param selector bem css selector
 * @returns the modifier value
 */
export const extractModifierValue = (selector: string): string =>
  selector.split(SEPERATOR.MODIFIER)[1].split(SEPERATOR.MODIFIER_VALUE)[1];
