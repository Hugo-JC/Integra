function escapeAttributeValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function tagName(element: Element): string {
  return element.tagName.toLowerCase();
}

/** A unique DOM locator is not a source-code location. */
export function findUniqueSelector(element: Element, root: ParentNode = document): string {
  const view = element.ownerDocument.defaultView;
  const cssEscape = view?.CSS?.escape?.bind(view.CSS);
  if (element.id) {
    const candidate = cssEscape ? `#${cssEscape(element.id)}` : `[id="${escapeAttributeValue(element.id)}"]`;
    try {
      if (root.querySelectorAll(candidate).length === 1) return candidate;
    } catch {
      // Continue with a structural selector.
    }
  }

  const segments: string[] = [];
  let current: Element | null = element;
  while (current && current !== element.ownerDocument.documentElement) {
    const name = tagName(current);
    const parent = current.parentElement;
    if (!parent) {
      segments.unshift(name);
      break;
    }
    const siblings = [...parent.children].filter((child) => child.tagName === current?.tagName);
    const index = siblings.indexOf(current) + 1;
    segments.unshift(`${name}:nth-of-type(${index})`);
    const candidate = segments.join(' > ');
    try {
      if (root.querySelectorAll(candidate).length === 1) return candidate;
    } catch {
      // Continue walking toward the root.
    }
    current = parent;
  }
  return segments.join(' > ') || tagName(element);
}

export function getAccessibleName(element: Element): string {
  const explicit = element.getAttribute('aria-label') || element.getAttribute('alt') || element.getAttribute('title');
  if (explicit?.trim()) return explicit.trim().slice(0, 160);
  const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
  return text.slice(0, 160);
}
