function escape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/** Best-effort DOM locator; it is never represented as a source-code path. */
export function buildElementSelector(element: Element): string {
  if (element.id) return `#${typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(element.id) : escape(element.id)}`;
  const explicit = element.getAttribute('data-integra-component') || element.getAttribute('data-testid');
  if (explicit) return `[${element.hasAttribute('data-integra-component') ? 'data-integra-component' : 'data-testid'}="${escape(explicit)}"]`;
  const parts: string[] = [];
  let current: Element | null = element;
  while (current && current.tagName.toLowerCase() !== 'html') {
    let segment = current.tagName.toLowerCase();
    const parent: Element | null = current.parentElement;
    if (parent) {
      const same = [...parent.children].filter((child) => child.tagName === current?.tagName);
      if (same.length > 1) segment += `:nth-of-type(${same.indexOf(current) + 1})`;
    }
    parts.unshift(segment);
    current = parent;
    if (current?.tagName.toLowerCase() === 'body') break;
  }
  return parts.join(' > ');
}

export function getElementLabel(element: Element): string {
  return element.getAttribute('data-integra-component') || element.getAttribute('aria-label') || element.tagName.toLowerCase();
}
