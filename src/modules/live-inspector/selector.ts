function escapeAttribute(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(value);
  return value.replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character.codePointAt(0)?.toString(16)} `);
}

function isUnique(selector: string, element: Element, doc: Document): boolean {
  try {
    const matches = doc.querySelectorAll(selector);
    return matches.length === 1 && matches[0] === element;
  } catch {
    return false;
  }
}

/** Best-effort DOM locator; it is never represented as a source-code path. */
export function findUniqueSelector(element: Element, doc: Document = element.ownerDocument): string {
  if (element.id) {
    const byId = `#${cssEscape(element.id)}`;
    if (isUnique(byId, element, doc)) return byId;
  }

  for (const attribute of ['data-integra-component', 'data-testid']) {
    const value = element.getAttribute(attribute);
    if (!value) continue;
    const candidate = `[${attribute}="${escapeAttribute(value)}"]`;
    if (isUnique(candidate, element, doc)) return candidate;
  }

  const parts: string[] = [];
  let current: Element | null = element;
  while (current && current.tagName.toLowerCase() !== 'html') {
    let segment = current.tagName.toLowerCase();
    const parentElement = current.parentElement;
    if (parentElement) {
      const sameTag = [...parentElement.children].filter((child) => child.tagName === current.tagName);
      if (sameTag.length > 1) segment += `:nth-of-type(${sameTag.indexOf(current) + 1})`;
    }
    parts.unshift(segment);
    const candidate = parts.join(' > ');
    if (isUnique(candidate, element, doc)) return candidate;
    current = parentElement;
  }
  return parts.join(' > ');
}

/** Compatibility helper retained for consumers of the original selector API. */
export function buildElementSelector(element: Element): string {
  return findUniqueSelector(element);
}

export function getAccessibleName(element: Element): string {
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const name = labelledBy.split(/\s+/)
      .map((id) => element.ownerDocument.getElementById(id)?.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' ');
    if (name) return name.slice(0, 160);
  }

  const ariaLabel = element.getAttribute('aria-label')?.trim();
  if (ariaLabel) return ariaLabel.slice(0, 160);

  const alt = element.getAttribute('alt')?.trim();
  if (alt) return alt.slice(0, 160);

  const labels = (element as Element & { labels?: NodeListOf<HTMLLabelElement> | null }).labels;
  if (labels?.length) {
    const name = [...labels].map((label) => label.textContent?.trim() ?? '').filter(Boolean).join(' ');
    if (name) return name.slice(0, 160);
  }

  const title = element.getAttribute('title')?.trim();
  if (title) return title.slice(0, 160);

  if (/^(BUTTON|A|SUMMARY)$/i.test(element.tagName)) {
    return (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 160);
  }
  return '';
}

/** Compatibility helper for older consumers. */
export function getElementLabel(element: Element): string {
  return element.getAttribute('data-integra-component')
    || getAccessibleName(element)
    || element.tagName.toLowerCase();
}
