export interface MutableAttributeElement {
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

export interface ElementAttributeSnapshot {
  classAttribute: string | null;
  styleAttribute: string | null;
}

/** Restores the exact original attributes, preserving absent vs empty attributes. */
export function restoreElementAttributes(
  element: MutableAttributeElement,
  snapshot: ElementAttributeSnapshot,
): void {
  if (snapshot.classAttribute === null) element.removeAttribute('class');
  else element.setAttribute('class', snapshot.classAttribute);

  if (snapshot.styleAttribute === null) element.removeAttribute('style');
  else element.setAttribute('style', snapshot.styleAttribute);
}
