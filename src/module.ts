import { Em, EmModifiers } from "./main";
import {
  camelCase,
  drop,
  head,
  isArray,
  isEmpty,
  isString,
  isUndefined,
  entries,
} from "lodash";
import clsx from "clsx";

type ClassRecord = Record<string, string | boolean>;

const modifierTemplate = (
  element: string,
  name: string,
  value?: string
): string =>
  isEmpty(value) ? `${element}--${name}` : `${element}--${name}-${value}`;

const multipleModifiers = (
  rules: Record<string, boolean>,
  values: string[],
  modifierName: string,
  selector: string,
  value: string
): Record<string, boolean> => {
  const currentValue = head(values);

  if (isUndefined(currentValue)) {
    return rules;
  }

  const newRules = {
    ...rules,
    [modifierTemplate(selector, modifierName, currentValue)]:
      currentValue === value,
  };
  const newValues = drop(values);

  return multipleModifiers(newRules, newValues, modifierName, selector, value);
};

const modifierClasses = <Type extends ClassRecord>(
  rules: Record<string, boolean>,
  modifiers: [string, string[] | boolean][],
  selector: string,
  props: Type
): Record<string, boolean> => {
  const currentModifier = head(modifiers);

  if (isUndefined(currentModifier)) {
    return rules;
  }

  const [modifierName, modifierValue] = currentModifier;
  const currentProp = props[modifierName];
  const newRules = {
    ...rules,
    ...(isArray(modifierValue) && isString(currentProp)
      ? multipleModifiers(
          {},
          modifierValue,
          selector,
          modifierName,
          currentProp
        )
      : { [modifierTemplate(selector, modifierName)]: Boolean(currentProp) }),
  };
  const newModifiers = drop(modifiers);

  return modifierClasses(newRules, newModifiers, selector, props);
};

const classes = <Type extends ClassRecord>(
  selector: string,
  modifiers: EmModifiers,
  props: Type
): string =>
  clsx(selector, modifierClasses({}, entries(modifiers), selector, props));

const classRecord = <Type extends ClassRecord>(
  record: ClassRecord,
  selectorModifiers: [string, EmModifiers][],
  props: Type
): ClassRecord | undefined => {
  const currentSelectorModifiers = head(selectorModifiers);

  if (isUndefined(currentSelectorModifiers)) {
    return record;
  }

  const [selector, modifiers] = currentSelectorModifiers;
  const newClassRecord = {
    ...record,
    [camelCase(selector)]: classes(selector, modifiers, props),
  };
  const newSelectorModifiers = drop(selectorModifiers);

  classRecord(newClassRecord, newSelectorModifiers, props);
};

export const createModule = <Type extends ClassRecord>(
  model: Em
): ((props: Type) => Record<string, string | boolean>) => {
  const selectorModifiers = entries(model);

  return (props) => <Type>classRecord({}, selectorModifiers, props);
};
