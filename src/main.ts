import { parse, findAll, CssNode, ClassSelector } from "css-tree";
import {
  extractBlockName,
  extractElementName,
  extractModifierName,
  extractModifierValue,
  hasElement,
  hasModifier,
  hasModifierValue,
} from "./utils/bem";
import { notEmpty } from "./utils/typeguards";
import { isTypeClassSelector } from "./utils/css-tree";
import { addUniqueToArray } from "./utils/array";

type CssSelector = string;
type BemModifierName = string;
type BemModifierValue = string;
type BemElementName = string;
type BemModifier = Record<BemModifierName, BemModifierValue[] | boolean>;
type BemElement = [BemElementName, BemModifier];
type Bem = [BemElement, BemElement[] | undefined];

const EMPTY_BEM_ELEMENT: BemElement = [undefined, undefined];

/**
 * Creates a bem modifier object with the value added from selector
 * @param selector modifier selector
 * @param existingModifierValues already existing modifier values
 * @returns BemModifier object
 */
export const addModifier = (
  selector: CssSelector,
  existingModifierValues: BemModifierValue[] = []
): BemModifier => {
  if (hasModifierValue(selector)) {
    return {
      [extractModifierName(selector)]: addUniqueToArray(
        existingModifierValues,
        extractModifierValue(selector)
      ),
    };
  }

  return hasModifier(selector) &&
    notEmpty(selector) &&
    extractModifierName(selector) !== ""
    ? {
        [extractModifierName(selector)]: true,
      }
    : {};
};

/**
 * Converts selectors to a BemElement object
 * @param bemElement a bem element name and modifier object
 * @param currentSelector a bem css selector
 * @returns a tuple with bem element name and modifier object
 */
export const classNamesToBemElement = (
  [elementName, modifiers]: BemElement,
  currentSelector: CssSelector
): BemElement => {
  if (notEmpty(elementName)) {
    const modifierName = extractModifierName(currentSelector);
    const modifierValue = modifiers[modifierName];
    const existingModifierValues: BemModifierValue[] = Array.isArray(
      modifierValue
    )
      ? modifierValue
      : [];

    return [
      elementName,
      {
        ...modifiers,
        ...addModifier(currentSelector, existingModifierValues),
      },
    ];
  }

  const extractName = hasElement(currentSelector)
    ? extractElementName
    : extractBlockName;

  // no previous values
  return [
    extractName(currentSelector),
    hasModifier(currentSelector) ? addModifier(currentSelector) : {},
  ];
};

/**
 * Gets block and element level selectors sorted in a tuple
 * @param ast CssTree ast
 * @returns a tuple with block level selectors and element level selectors
 */
export const getBlockAndElementLevelClassnames = (
  ast: CssNode
): [CssSelector[], CssSelector[]] =>
  findAll(ast, isTypeClassSelector).reduce<[CssSelector[], CssSelector[]]>(
    ([blockClasses, elementClasses], node: ClassSelector) =>
      hasElement(node.name)
        ? [blockClasses, addUniqueToArray(elementClasses, node.name)]
        : [addUniqueToArray(blockClasses, node.name), elementClasses],
    [[], []]
  );

/**
 * Groups selectors by their BEM element
 * @param groupedElements a object with selectors sorted by element
 * @param className a bem css selector
 * @returns a object with selectors sorted by elements
 */
export const groupByElement = (
  groupedElements: Record<BemElementName, CssSelector[]>,
  className: CssSelector
): Record<BemElementName, CssSelector[]> => {
  const elementName = extractElementName(className);
  const hasElementName = elementName in groupedElements;

  return {
    ...groupedElements,
    [elementName]: hasElementName
      ? [...groupedElements[elementName], className]
      : [className],
  };
};

/**
 * create the object needed to create a module
 * @param code css code
 * @returns a Bem object
 */
export function createModule(code: string): Bem {
  const ast = parse(code);
  const [blockSelectors, elementSelectors] =
    getBlockAndElementLevelClassnames(ast);
  const block = blockSelectors.reduce<BemElement>(
    classNamesToBemElement,
    EMPTY_BEM_ELEMENT
  );
  const groupedElements = elementSelectors.reduce<Record<string, string[]>>(
    groupByElement,
    {}
  );
  const elements = Object.entries(groupedElements).map(([, classNames]) =>
    classNames.reduce<BemElement>(classNamesToBemElement, EMPTY_BEM_ELEMENT)
  );

  return [block, elements];
}

/*
function main() {
  try {
    const file = resolve(__dirname, "../../src/assets/button.css");
    const code = readFileSync(file, "utf-8");
    console.log(JSON.stringify(createModule(code)));
  } catch (err) {
    console.log(err);
  }
}

main();
*/
