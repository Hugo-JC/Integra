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

/** Returns a best-effort accessible name without claiming a complete ARIA computation. */
export function getAccessibleName(element: Element): string {
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const name = labelledBy
      .split(/\s+/)
      .map((id) => element.ownerDocument.getElementById(id)?.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' ');
    if (name) return name;
  }
  const ariaLabel = element.getAttribute('aria-label')?.trim();
  if (ariaLabel) return ariaLabel;
  const alt = element.getAttribute('alt')?.trim();
  if (alt) return alt;
  if (element instanceof HTMLLabelElement && element.control) return element.textContent?.trim() ?? '';
  if (element instanceof HTMLInputElement && element.labels?.length) {
    return [...element.labels].map((label) => label.textContent?.trim() ?? '').filter(Boolean).join(' ');
  }
  return element.textContent?.trim().replace(/\s+/g, ' ') || element.getAttribute('title')?.trim() || '';
}

/** Builds a DOM selector and verifies it identifies only the requested element. */
export function findUniqueSelector(element: Element, doc: Document = element.ownerDocument): string {
  const selector = buildElementSelector(element);
  try {
    if (doc.querySelectorAll(selector).length === 1) return selector;
  } catch {
    // Fall through to a structural selector if the preferred locator is invalid.
  }
  const parts: string[] = [];
  let current: Element | null = element;
  while (current) {
    let segment = current.tagName.toLowerCase();
    const parent: Element | null = current.parentElement;
    if (parent) {
      const sameTag = [...parent.children].filter((child) => child.tagName === current?.tagName);
      segment += `:nth-of-type(${sameTag.indexOf(current) + 1})`;
    }
    parts.unshift(segment);
    if (current === doc.documentElement) break;
    current = parent;
  }
  return parts.join(' > ');
}
