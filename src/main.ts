import { readFileSync } from "fs";
import { resolve } from "path";
import { parse, findAll, CssNode } from "css-tree";
import { isUndefined, isString, isArray } from "lodash";

type BemModifier = Record<string, string[]>;
type BemElement = [string, BemModifier | undefined];
type Bem = [BemElement, BemElement[] | undefined];

const seperator = {
  element: "__",
  modifier: "--",
  modifierValue: "-",
};

/** Checks if value is not `null` or `undefined`
 * @param value the value you wan't to check
 * @returns `true` if value is not `null` or `undefined`
 */
const notEmpty = <TValue>(value: TValue | null | undefined): value is TValue =>
  value !== null && value !== undefined;

/**
 * Gets the list of class selectors from AST
 * @param ast CSS Ast Object
 * @returns an array of class selectors as strings
 */
const classSelectorsFromAst = (ast: CssNode): string[] =>
  findAll(ast, (node) => node.type === "ClassSelector")
    .map((selector) =>
      selector.type === "ClassSelector" ? selector.name : undefined
    )
    .filter(notEmpty);

/**
 * Checks if selector is an element selector
 * @param selector bem css selector
 * @returns `true` if the selector is a element class
 */
const hasElement = (selector: string): boolean =>
  selector.includes(seperator.element);

/**
 * Checks if selector is an modifier selector
 * @param selector bem css selector
 * @returns `true` if the selector is a modifier class
 */
const hasModifier = (selector: string): boolean =>
  selector.includes(seperator.modifier);

/**
 * Get the block element(s) for a list of selectors
 * @param selectors array of bem css selectors
 * @returns a `string` if there's only one possible block element, an `array` if there's multiple and `undefined` if none
 */
const getBlock = (selectors: string[]): string | string[] | undefined =>
  selectors
    .filter((selector) => !hasElement(selector) && !hasModifier(selector))
    .reduce((prev, curr) => {
      if (isUndefined(prev)) return curr;
      if (isString(prev)) {
        if (prev === curr) return prev;
        return [prev, curr];
      }
      return [...prev, curr];
    }, undefined);

/**
 * Get a list of all element selectors
 * @param selectors array of bem css selectors
 * @returns an `array` of element selectors
 */
const getElements = (selectors: string[]): string[] =>
  selectors
    .filter((selector) => hasElement(selector))
    .map((selector) => selector.split(seperator.modifier)[0])
    .reduce((prev, curr) => (prev.includes(curr) ? prev : [...prev, curr]), [])
    .map((selector) => selector.split(seperator.element)[1]);

const getBlockName = (selector: string): string => {
  if (hasElement(selector)) {
    return selector.split(seperator.element)[0];
  }
  if (hasModifier) {
    return selector.split(seperator.modifier)[0];
  }
  return selector;
};
const getModifierName = (selector: string): string =>
  selector.split(seperator.modifier)[1].split(seperator.modifierValue)[0];
const getModifierValue = (selector: string): string =>
  selector.split(seperator.modifier)[1].split(seperator.modifierValue)[1];

function createBem(selectors: string[]): Bem {
  return selectors.reduce(
    ([block, elements], selector) => {
      // it's a block level selector
      if (!hasElement(selector)) {
        if (hasModifier(selector)) {
          if (isUndefined(block)) {
            return [
              [
                getBlockName(selector),
                { [getModifierName(selector)]: [getModifierValue(selector)] },
              ],
              elements,
            ];
          }
          const [blockName, modifiers] = block;
          if (isUndefined(modifiers)) {
            //
            return [
              [
                blockName,
                { [getModifierName(selector)]: [getModifierValue(selector)] },
              ],
              elements,
            ];
          }

          if (getModifierName(selector) in modifiers) {
            return [
              [
                blockName,
                {
                  ...modifiers,
                  [getModifierName(selector)]: [
                    ...modifiers[
                      (getModifierName(selector), getModifierValue(selector))
                    ],
                  ],
                },
              ],
            ];
          }

          return [block, elements];
        }
        if (isUndefined(block)) {
          return [[selector, undefined], elements];
        }
        return [block, elements];
      }
      return [block, elements];
    },
    [undefined, undefined]
  );
}

function createModule(code: string): void {
  const ast = parse(code);
  const selectors = classSelectorsFromAst(ast);
  const bem = createBem(selectors);
  console.log(bem);
}

function main() {
  try {
    const file = resolve(__dirname, "../../src/assets/button.css");
    const code = readFileSync(file, "utf-8");
    createModule(code);
  } catch (err) {
    console.log(err);
  }
}

main();
