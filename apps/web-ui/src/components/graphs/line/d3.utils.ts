import { Selection, BaseType } from "d3";

interface SelectOrAppendOptions {
  id?: string;
  className?: string;
  prepend?: boolean;
}

/**
 * Selects a child element based on a selector from a parent selection.
 * If the element does not exist, it appends the element with the specified tag, id, and class.
 *
 * @param parent - The parent D3 selection.
 * @param selector - The selector string to select the child element.
 * @param tag - The tag name of the element to append if the selection is empty.
 * @param options - Optional id and className to apply to the element.
 * @returns A D3 selection of the existing or newly appended element.
 */
export function selectOrAppend<
  GElement extends BaseType,
  PElement extends BaseType,
  PDatum
>(
  parent: Selection<PElement, PDatum, null, undefined>,
  selector: string,
  tag: string,
  options?: SelectOrAppendOptions
): Selection<GElement, PDatum, any, any> {
  let selection = parent.select<GElement>(selector);
  if (selection.empty()) {
    if (options?.prepend) {
      selection = parent.insert<GElement>(tag, ":first-child");
    } else {
      selection = parent.append<GElement>(tag);
    }

    if (options?.id) {
      selection.attr("id", options.id);
    }
    if (options?.className) {
      selection.attr("class", options.className);
    }
  }
  return selection;
}
