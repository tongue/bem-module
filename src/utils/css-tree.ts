import { CssNode } from "css-tree";

/**
 * Check if node type is ClassSelector
 * @param node css-tree CssNode
 * @returns boolean
 */
export const isTypeClassSelector = (node: CssNode): boolean =>
  node.type === "ClassSelector";
