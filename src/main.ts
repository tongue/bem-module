import { parse, findAll, ClassSelector, CssNode } from "css-tree";

type CssSelector = string;
type EmModifierName = string;
type EmModifierValue = string[] | boolean;
type EmModifiers = { [key: EmModifierName]: EmModifierValue };
type Em = { [key: CssSelector]: EmModifiers };
type EmShape = {
  element: string;
  modifier?: string;
  value?: string;
};

/*
 * Groups block and element into one group named `element`
 * Names the value of the modifier to `modifier`
 * Names the value of the value to `value`
 */
const EM_REGEXP =
  /(?<element>^[^-\s]+)?(?:--(?<modifier>[^_\-\s]+))?(?:-(?<value>[^_\-\s]+))?/;

/**
 * Check if node is of type `ClassSelector`
 * @param node css-tree CssNode
 * @returns boolean
 */
const isTypeClassSelector = (node: CssNode): boolean =>
  node.type === "ClassSelector";

/** Checks if value is not `null` or `undefined`
 * @param value the value you wan't to check
 * @returns `true` if value is not `null` or `undefined`
 */
const notEmpty = <Type>(value: Type | null | undefined): value is Type =>
  value !== null && value !== undefined;

/**
 * Add unique item to an array
 * @param arr the array you want to add a value to
 * @param value the value you want to add
 * @returns a new array with a possible new value
 */
const appendUnique = <Type = unknown>(arr: Type[], value: Type): Type[] =>
  arr.includes(value) ? arr : [...arr, value];

/**
 * Extracts `element`, `modifier` and `value` from string
 * @param selector CssSelector
 * @returns an object with keys for `element`, `modifier` and `value`.
 */
const getEmValues = (selector: CssSelector): EmShape => {
  const values = selector.match(EM_REGEXP)?.groups;

  if (notEmpty(values) && notEmpty(values.element)) {
    return { ...values, element: values.element };
  }

  return { element: selector };
};

/**
 * Get the CssSelector from a ClassSelector
 * @param node a ClassSelector from css-tree
 * @returns a CssSelector
 */
const getNodeName = (node: ClassSelector): CssSelector => node.name;

/**
 * Creates a modifier value
 * @param existing array of existing values
 * @param value the value to add
 * @returns an array with unique values or a boolean
 */
const modifierValue = (
  existing: EmModifierValue = [],
  value?: string
): string[] | boolean =>
  Array.isArray(existing) && notEmpty(value)
    ? appendUnique(existing, value)
    : true;

/**
 * Creates a modifier object
 * @param existing the current modifier object
 * @param name the name of the modifier
 * @param value the value of the modifier
 * @returns a new modifier object
 */
const modifier = (
  existing: EmModifiers = {},
  name: string,
  value?: string
): EmModifiers => ({
  ...existing,
  [name]: modifierValue(existing[name], value),
});

/**
 * Converts a CssSelector in to an EmObject
 * @param previous current Em object
 * @param selector a CssSelector
 * @returns a new Em object
 */
const toEm = (previous: Em, selector: CssSelector): Em => {
  const { element, modifier: modifierName, value } = getEmValues(selector);

  return {
    ...previous,
    [element]: notEmpty(modifierName)
      ? modifier(previous[element], modifierName, value)
      : {},
  };
};

/**
 * Creates a em object out of css
 * @param code css code as a string
 * @returns a Em object
 */
export function createModule(code: string): Em {
  const ast = parse(code);
  const bem = findAll(ast, isTypeClassSelector)
    .map(getNodeName)
    .reduce<CssSelector[]>(appendUnique, [])
    .reduce<Em>(toEm, {});

  return bem;
}
