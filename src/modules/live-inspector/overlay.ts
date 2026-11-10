import { calculateLiveContrast } from './contrast.js';
import { restoreElementAttributes } from './dom.js';
import { createLivePreviewHistory } from './history.js';
import { colorToHex, parseCssColor, compositeColors } from './color.js';
import { createElementChangeSet, synthesizeLivePrompt } from './diff.js';
import { getAccessibleName, findUniqueSelector } from './selector.js';
import type { IntegraLiveInspectorController, IntegraLiveInspectorOptions, LiveEditableProperty, LiveElementChangeSet, LiveElementSnapshot } from './types.js';

interface OriginalElementState {
  snapshot: LiveElementSnapshot;
  originalStyleAttribute: string | null;
  originalClassAttribute: string | null;
  originalClasses: string;
  originalComputedStyles: Record<string, string>;
}

const EDITABLE_PROPERTIES: LiveEditableProperty[] = ['color', 'background-color', 'border-radius', 'padding'];

function isElement(value: EventTarget | null): value is Element {
  return Boolean(value && (value as Node).nodeType === 1);
}

function computedValue(element: Element, property: string, doc: Document): string {
  return doc.defaultView?.getComputedStyle(element).getPropertyValue(property).trim() ?? '';
}

function resolveCompositedBackground(element: Element, doc: Document): string | null {
  const transparentLayers: NonNullable<ReturnType<typeof parseCssColor>>[] = [];
  let current: Element | null = element;
  let opaqueBase: NonNullable<ReturnType<typeof parseCssColor>> | null = null;

  // A gradient/image/blend mode changes the rendered backdrop; do not report a guessed ratio.
  while (current) {
    const image = computedValue(current, 'background-image', doc);
    const blend = computedValue(current, 'background-blend-mode', doc);
    if ((image && image !== 'none') || (blend && blend !== 'normal')) return null;

    const opacity = Number.parseFloat(computedValue(current, 'opacity', doc));
    if (Number.isFinite(opacity) && opacity < 0.999) return null;

    const parsed = parseCssColor(computedValue(current, 'background-color', doc));
    if (parsed && parsed.alpha >= 0.999) {
      opaqueBase = parsed;
      break;
    }
    if (parsed && parsed.alpha > 0) transparentLayers.push(parsed);
    current = current.parentElement;
  }

  if (!opaqueBase) return null;
  let result = opaqueBase;
  for (const layer of transparentLayers.reverse()) {
    result = compositeColors(layer, result);
  }
  return colorToHex(result);
}

function createSnapshot(element: Element, doc: Document, sourceHint?: string): LiveElementSnapshot {
  return {
    selector: findUniqueSelector(element, doc),
    tagName: element.tagName,
    accessibleName: getAccessibleName(element),
    originalClasses: element.getAttribute('class') ?? '',
    ...((sourceHint ?? element.getAttribute('data-integra-source')) ? { componentHint: sourceHint ?? element.getAttribute('data-integra-source')! } : {}),
  };
}

/**
 * Browser-only opt-in inspector. Edits are temporary DOM previews; this module
 * never writes application source files or contacts an AI provider.
 */
export function createIntegraInspector(options: IntegraLiveInspectorOptions = {}): IntegraLiveInspectorController {
  if (typeof document === 'undefined') throw new Error('Integra Live Inspector requires a browser document.');
  const doc = document;
  const view = doc.defaultView ?? (() => { throw new Error('Integra Live Inspector requires an active browser window.'); })();
  if (!doc.body) throw new Error('Integra Live Inspector must start after document.body is available.');

  const requestedAccent = options.accentColor ?? '#3B82F6';
  const accent = typeof CSS !== 'undefined' && CSS.supports('color', requestedAccent) ? requestedAccent : '#3B82F6';
  if (options.ignoreSelector) {
    try {
      doc.createElement('div').matches(options.ignoreSelector);
    } catch {
      throw new TypeError('Integra Live Inspector received an invalid ignoreSelector CSS selector.');
    }
  }

  const host = doc.createElement('div');
  host.id = 'integra-inspector-ui';
  host.setAttribute('data-integra-inspector', 'true');
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
:host{all:initial;color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:13px}*{box-sizing:border-box}
#highlight{position:fixed;display:none;border:2px solid #3B82F6;border-radius:5px;background:rgba(59,130,246,.075);box-shadow:0 0 0 1px #fff,0 0 0 5px rgba(59,130,246,.12);pointer-events:none}
#tag{position:fixed;display:none;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:5px 8px;border:1px solid #3b82f6;border-radius:6px;color:#eff6ff;background:#10264a;font:11px ui-monospace,monospace;pointer-events:none}
#panel{position:fixed;top:14px;right:14px;width:min(388px,calc(100vw - 28px));max-height:calc(100vh - 28px);overflow:auto;border:1px solid #27364b;border-radius:16px;background:rgba(10,16,27,.97);box-shadow:0 24px 72px rgba(0,0,0,.46);color:#e8eef8;pointer-events:auto;backdrop-filter:blur(18px);scrollbar-width:thin;scrollbar-color:#34445d transparent}#panel[hidden]{display:none}
.head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 15px 12px;border-bottom:1px solid #243247}.brand{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:750;letter-spacing:-.025em}.mark{display:grid;place-items:center;width:27px;height:27px;border:1px solid #3b82f6;border-radius:8px;background:linear-gradient(145deg,#1d4ed8,#2563eb);color:white;font-size:14px}.head-actions{display:flex;gap:6px}
button{min-height:30px;border:1px solid #30415a;border-radius:8px;background:#152238;color:#dce8fa;padding:6px 9px;cursor:pointer;font:600 11px/1.2 Inter,ui-sans-serif,system-ui,sans-serif}button:hover{border-color:#60a5fa;background:#1b3150}button:focus-visible,input:focus-visible{outline:2px solid #60a5fa;outline-offset:2px}button.primary{border-color:#2563eb;background:#2563eb;color:#fff}
.modebar{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:12px 14px;padding:4px;border:1px solid #26364d;border-radius:10px;background:#0b1423}.modebar button{border-color:transparent;background:transparent;color:#8fa4c1}.modebar button[aria-pressed=true]{border-color:#2e5fa5;background:#17345d;color:#eff6ff}
.content{padding:0 14px 14px}#instructions{margin:0 0 10px;color:#9fb0c8;font-size:11px;line-height:1.5}.target{padding:11px;border:1px solid #2b466a;border-radius:11px;background:linear-gradient(135deg,rgba(29,78,216,.18),rgba(15,23,42,.6));overflow-wrap:anywhere}.target strong{display:block;color:#f4f8ff;font-size:12px}
.muted{color:#8ea1bd;font-size:10px;line-height:1.5;overflow-wrap:anywhere}.eyebrow{display:block;margin:14px 0 6px;color:#91a6c3;font-size:9px;font-weight:750;letter-spacing:.12em;text-transform:uppercase}
label{display:block;margin:11px 0 5px;color:#a8bad3;font-size:10px;font-weight:700;text-transform:uppercase}input{width:100%;min-width:0;border:1px solid #30415a;border-radius:8px;padding:8px 9px;background:#0d1829;color:#eef5ff;font:11px ui-monospace,monospace}input[type=color]{height:35px;padding:3px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 10px}.quick-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.quick-grid button{min-height:38px;text-align:left;padding:8px 10px}.quick-grid button span{display:block;color:#8fa4c1;font-size:9px;font-weight:500;margin-top:2px}
.metric-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px}.metric{padding:8px 7px;border:1px solid #26364d;border-radius:8px;background:#0d1829}.metric b{display:block;color:#e8f1ff;font-size:12px;font-variant-numeric:tabular-nums}.metric span{display:block;margin-top:2px;color:#8499b6;font-size:9px}
.contrast{margin-top:10px;padding:10px;border:1px solid #30415a;border-radius:9px;background:#0d1829;color:#b8c8dd;font-size:10px;line-height:1.55}.actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:13px}.actions button{flex:1}#status{min-height:16px;margin-top:10px;color:#93c5fd;font-size:10px;line-height:1.5}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{transition:none!important;animation:none!important}}@media(prefers-contrast:more){#panel{border:2px solid #93c5fd}button,input{border-color:#93c5fd}}@media(max-width:520px){#panel{top:auto;right:8px;bottom:8px;left:8px;width:auto;max-height:min(72vh,620px);border-radius:14px}}
    </style>
    <div id="highlight" aria-hidden="true"></div>
    <div id="tag" aria-hidden="true"></div>
    <section id="panel" data-mode="quick" role="dialog" aria-label="Integra Live Workbench">
      <div class="head"><div class="brand"><span class="mark">✳</span><span id="title">Integra Live</span></div><div class="head-actions"><button type="button" data-action="unlock" title="Selecionar elemento">Pick</button><button type="button" data-action="close" aria-label="Fechar inspector">×</button></div></div>
      <div class="modebar" role="group" aria-label="Modo do inspector"><button type="button" data-action="mode-quick" aria-pressed="true">Quick Canvas</button><button type="button" data-action="mode-advanced" aria-pressed="false">Inspector</button></div>
      <div class="content"><p id="instructions">Ativa o picker, aponta e seleciona. Pré-visualiza alterações sem tocar no código-fonte.</p>
      <div class="target"><strong id="target-name">Nenhum elemento selecionado</strong><div id="target-selector" class="muted">Usa Pick e clica num elemento da página.</div></div>
      <div class="metric-grid"><div class="metric"><b id="metric-size">—</b><span>Dimensões</span></div><div class="metric"><b id="metric-display">—</b><span>Display</span></div><div class="metric"><b id="metric-font">—</b><span>Fonte</span></div></div>
      <div id="quick-tools"><span class="eyebrow">Ajustes rápidos</span><div class="quick-grid"><button type="button" data-action="quick-radius">Radius +<span>Suavizar cantos</span></button><button type="button" data-action="quick-padding">Padding +<span>Mais espaço interno</span></button><button type="button" data-action="quick-color">Azul Integra<span>Preview de destaque</span></button><button type="button" data-action="quick-reset">Repor preview<span>Restaurar elemento</span></button></div></div>
      <div id="advanced-tools" hidden><span class="eyebrow">Estrutura e classes</span><label for="classes">Classes do elemento</label><input id="classes" data-field="classes" type="text" spellcheck="false" autocomplete="off" placeholder="className / Tailwind utilities"><span class="eyebrow">Estilo visual</span><div class="grid"><div><label for="text-color">Cor do texto</label><input id="text-color" data-field="color" type="color" value="#ffffff"></div><div><label for="surface-color">Cor de fundo</label><input id="surface-color" data-field="background-color" type="color" value="#111111"></div><div><label for="radius">Border radius (px)</label><input id="radius" data-field="border-radius" type="number" min="0" max="64" step="1"></div><div><label for="padding">Padding (px)</label><input id="padding" data-field="padding" type="number" min="0" max="128" step="1"></div></div></div>
      <div class="contrast" id="contrast" aria-live="polite">Seleciona um elemento para avaliar o contraste.</div><div class="actions"><button type="button" data-action="undo" disabled aria-label="Desfazer última alteração">↶ Undo</button><button type="button" data-action="redo" disabled aria-label="Refazer alteração">↷ Redo</button><button type="button" data-action="unlock">Selecionar</button><button type="button" data-action="reset">Repor</button><button type="button" class="primary" data-action="apply">Exportar diff</button></div><div id="status" role="status" aria-live="polite"></div><p class="muted">Azul Integra · Preview temporário · Alt + Shift + I alterna · Esc restaura e fecha</p></div>
    </section>  `;

  const highlight = shadow.querySelector<HTMLElement>('#highlight');
  const tag = shadow.querySelector<HTMLElement>('#tag');
  const panel = shadow.querySelector<HTMLElement>('#panel');
  const status = shadow.querySelector<HTMLElement>('#status');
  const targetName = shadow.querySelector<HTMLElement>('#target-name');
  const targetSelector = shadow.querySelector<HTMLElement>('#target-selector');
  const contrastOutput = shadow.querySelector<HTMLElement>('#contrast');
  const title = shadow.querySelector<HTMLElement>('#title');
  if (!highlight || !tag || !panel || !status || !targetName || !targetSelector || !contrastOutput || !title) {
    throw new Error('Integra Live Inspector could not initialize its shadow UI.');
  }
  title.textContent = options.title ?? options.panelTitle ?? 'Integra Live Inspector';
  const undoButton = shadow.querySelector<HTMLButtonElement>('[data-action="undo"]');
  const redoButton = shadow.querySelector<HTMLButtonElement>('[data-action="redo"]');

  const originals = new Map<Element, OriginalElementState>();
  const history = createLivePreviewHistory<Element>(100);
  const captureAttributes = (element: Element) => ({ classAttribute: element.getAttribute('class'), styleAttribute: element.getAttribute('style') });
  const refreshHistoryControls = (): void => {
    if (undoButton) undoButton.disabled = !history.canUndo();
    if (redoButton) redoButton.disabled = !history.canRedo();
  };
  const recordHistory = (element: Element, before: ReturnType<typeof captureAttributes>, label: string): void => {
    history.record(element, before, captureAttributes(element), label);
    refreshHistoryControls();
  };
  let selected: HTMLElement | SVGElement | null = null;
  let highlighted: Element | null = null;
  let selectionLocked = false;
  let enabled = options.enabled ?? true;
  let stopped = false;
  const previouslyFocused = doc.activeElement instanceof view.HTMLElement ? doc.activeElement : null;
  let geometryFrame = 0;
  let pointerFrame = 0;
  let pendingPointerTarget: Element | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const isInspectorEvent = (event: Event): boolean => event.composedPath().includes(host);
  const isInspectable = (element: Element): element is HTMLElement | SVGElement => {
    const ignored = new Set(['HTML', 'BODY', 'SCRIPT', 'STYLE', 'LINK', 'META', 'HEAD']);
    if (ignored.has(element.tagName) || !('style' in element)
      || element.closest('[data-integra-inspector="true"], [data-integra-ignore]')) return false;
    return !options.ignoreSelector || !element.matches(options.ignoreSelector);
  };

  const positionHighlight = (element: Element): void => {
    if (!element.isConnected) {
      highlighted = null;
      highlight.style.display = 'none';
      tag.style.display = 'none';
      return;
    }
    if (highlighted && highlighted !== element && highlighted !== selected) {
      resizeObserver?.unobserve(highlighted);
    }
    highlighted = element;
    resizeObserver?.observe(element);
    const rect = element.getBoundingClientRect();
    highlight.style.display = 'block';
    highlight.style.left = `${Math.max(0, rect.left)}px`;
    highlight.style.top = `${Math.max(0, rect.top)}px`;
    highlight.style.width = `${Math.max(0, rect.width)}px`;
    highlight.style.height = `${Math.max(0, rect.height)}px`;
    tag.style.display = 'block';
    tag.style.left = `${Math.max(0, rect.left)}px`;
    tag.style.top = `${Math.max(4, rect.top - 25)}px`;
    tag.textContent = `<${element.tagName.toLowerCase()}>`;
  };

  const scheduleGeometryUpdate = (): void => {
    if (geometryFrame || stopped) return;
    geometryFrame = view.requestAnimationFrame(() => {
      geometryFrame = 0;
      if (!enabled) {
        highlight.style.display = 'none';
        tag.style.display = 'none';
        return;
      }
      const target = selected?.isConnected ? selected : highlighted;
      if (target?.isConnected) positionHighlight(target);
      else {
        highlighted = null;
        highlight.style.display = 'none';
        tag.style.display = 'none';
      }
    });
  };

  const currentComputed = (element: Element): Record<string, string> => {
    const style = view.getComputedStyle(element);
    return {
      color: style.color,
      'background-color': style.backgroundColor,
      'border-radius': style.borderRadius,
      padding: style.padding,
      'font-size': style.fontSize,
      'font-weight': style.fontWeight,
    };
  };

  const updateContrast = (element: Element): void => {
    const values = currentComputed(element);
    const background = resolveCompositedBackground(element, doc);
    const result = background
      ? calculateLiveContrast(values.color, background, Number.parseFloat(values['font-size']), Number.parseInt(values['font-weight'], 10))
      : null;
    if (!result) {
      contrastOutput.textContent = 'Contraste inconclusivo: não foi possível resolver uma cor de fundo opaca. Verifica gradientes, imagens, pseudo-elementos e camadas.';
      contrastOutput.style.borderColor = '#B45309';
      return;
    }
    contrastOutput.textContent = `Contraste ${result.ratio}:1 · WCAG AA ${result.passesAA ? 'passou' : 'não passou'} (mínimo ${result.requiredRatio}:1)${result.isLargeText ? ' · texto grande' : ''}`;
    contrastOutput.style.borderColor = result.passesAA ? accent : '#B45309';
  };

  const selectElement = (element: HTMLElement | SVGElement): void => {
    selected = element;
    selectionLocked = true;
    resizeObserver?.disconnect();
    resizeObserver?.observe(element);
    if (!originals.has(element)) {
      originals.set(element, {
        snapshot: createSnapshot(element, doc, options.sourceHint),
        originalStyleAttribute: element.getAttribute('style'),
        originalClassAttribute: element.getAttribute('class'),
        originalClasses: element.getAttribute('class') ?? '',
        originalComputedStyles: currentComputed(element),
      });
    }
    const original = originals.get(element);
    if (!original) return;
    const values = currentComputed(element);
    const rect = element.getBoundingClientRect();
    const metricSize = shadow.querySelector<HTMLElement>('#metric-size');
    const metricDisplay = shadow.querySelector<HTMLElement>('#metric-display');
    const metricFont = shadow.querySelector<HTMLElement>('#metric-font');
    if (metricSize) metricSize.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
    if (metricDisplay) metricDisplay.textContent = view.getComputedStyle(element).display;
    if (metricFont) metricFont.textContent = `${Math.round(Number.parseFloat(values['font-size']) || 0)}px`;
    const classInput = shadow.querySelector<HTMLInputElement>('[data-field="classes"]');
    if (classInput) classInput.value = element.getAttribute('class') ?? '';
    for (const property of ['color', 'background-color'] as const) {
      const input = shadow.querySelector<HTMLInputElement>(`[data-field="${property}"]`);
      const hex = colorToHex(parseCssColor(values[property]));
      if (input && hex) input.value = hex;
    }
    const radius = shadow.querySelector<HTMLInputElement>('[data-field="border-radius"]');
    const padding = shadow.querySelector<HTMLInputElement>('[data-field="padding"]');
    if (radius) radius.value = String(Number.parseFloat(values['border-radius']) || 0);
    if (padding) padding.value = String(Number.parseFloat(values.padding) || 0);
    const accessibleName = getAccessibleName(element);
    targetName.textContent = `<${element.tagName.toLowerCase()}>${accessibleName ? ` · ${accessibleName}` : ''}`;
    targetSelector.textContent = original.snapshot.selector;
    updateContrast(element);
    positionHighlight(element);
    scheduleGeometryUpdate();
    panel.hidden = !enabled;
    status.textContent = 'Elemento selecionado. As alterações ainda não foram escritas no código-fonte.';
    options.onSelectionChange?.(element instanceof view.HTMLElement ? element : null);
    notifyChanges();
  };

  const applyProperty = (property: LiveEditableProperty, value: string): void => {
    if (!selected) return;
    const before = captureAttributes(selected);
    selected.style.setProperty(property, value, 'important');
    recordHistory(selected, before, property);
    updateContrast(selected);
    positionHighlight(selected);
    notifyChanges();
  };

  const restoreElement = (element: Element, original: OriginalElementState): void => {
    restoreElementAttributes(element, {
      classAttribute: original.originalClassAttribute,
      styleAttribute: original.originalStyleAttribute,
    });
  };

  const buildChangeSets = (): LiveElementChangeSet[] => {
    const changes: LiveElementChangeSet[] = [];
    for (const [element, original] of originals) {
      const updatedClasses = element.getAttribute('class') ?? '';
      const contrastBackground = resolveCompositedBackground(element, doc);
      const computed = currentComputed(element);
      const contrast = contrastBackground
        ? calculateLiveContrast(computed.color, contrastBackground, Number.parseFloat(computed['font-size']), Number.parseInt(computed['font-weight'], 10))
        : null;
      const change = createElementChangeSet({
        target: original.snapshot,
        updatedClasses,
        beforeStyles: original.originalComputedStyles,
        afterStyles: currentComputed(element),
        contrast,
      });
      if (change.addedClasses.length || change.removedClasses.length || change.styleChanges.length) changes.push(change);
    }
    return changes;
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (stopped || !enabled || selectionLocked || isInspectorEvent(event)) return;
    const candidate = event.composedPath().find(isElement);
    if (!candidate || !isInspectable(candidate)) return;
    pendingPointerTarget = candidate;
    if (pointerFrame) return;
    pointerFrame = view.requestAnimationFrame(() => {
      pointerFrame = 0;
      const target = pendingPointerTarget;
      pendingPointerTarget = null;
      if (!stopped && enabled && !selectionLocked && target?.isConnected) positionHighlight(target);
    });
  };

  const onClick = (event: MouseEvent): void => {
    if (stopped || !enabled || selectionLocked || isInspectorEvent(event)) return;
    const candidate = event.composedPath().find(isElement);
    if (!candidate || !isInspectable(candidate)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    selectElement(candidate);
  };

  const onInput = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof view.HTMLInputElement)) return;
    const property = target.dataset.field;
    if (property === 'classes' && selected) {
      const before = captureAttributes(selected);
      if (target.value.trim()) selected.setAttribute('class', target.value);
      else selected.removeAttribute('class');
      recordHistory(selected, before, 'classes');
      positionHighlight(selected);
      notifyChanges();
      return;
    }
    if (property && EDITABLE_PROPERTIES.includes(property as LiveEditableProperty)) {
      const unit = property === 'border-radius' || property === 'padding' ? 'px' : '';
      const numeric = unit ? Number(target.value) : Number.NaN;
      if (unit && (!Number.isFinite(numeric) || numeric < 0 || numeric > 512)) return;
      applyProperty(property as LiveEditableProperty, `${target.value}${unit}`);
    }
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (stopped) return;
    const target = event.composedPath()[0] ?? event.target;
    if (target instanceof view.HTMLElement
      && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) redoPreview();
      else undoPreview();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      stop({ restore: true });
      return;
    }
    if (options.keyboardShortcut !== false && event.altKey && event.shiftKey && event.key.toLowerCase() === 'i') {
      event.preventDefault();
      enabled = !enabled;
      panel.hidden = !enabled;
      if (!enabled) {
        highlight.style.display = 'none';
        tag.style.display = 'none';
      } else if (selected) {
        positionHighlight(selected);
      }
    }
  };

  const onPanelClick = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof view.Element)) return;
    const button = target.closest<HTMLButtonElement>('button[data-action]');
    const action = button?.dataset.action;
    if (!action) return;
    if (action === 'close') {
      stop({ restore: true });
      return;
    }
    if (action === 'mode-quick' || action === 'mode-advanced') {
      const mode = action === 'mode-advanced' ? 'advanced' : 'quick';
      panel.dataset.mode = mode;
      const quick = shadow.querySelector<HTMLElement>('#quick-tools');
      const advanced = shadow.querySelector<HTMLElement>('#advanced-tools');
      const qb = shadow.querySelector<HTMLButtonElement>('[data-action="mode-quick"]');
      const ab = shadow.querySelector<HTMLButtonElement>('[data-action="mode-advanced"]');
      if (quick) quick.hidden = mode !== 'quick';
      if (advanced) advanced.hidden = mode !== 'advanced';
      qb?.setAttribute('aria-pressed', String(mode === 'quick'));
      ab?.setAttribute('aria-pressed', String(mode === 'advanced'));
      return;
    }
    if (action === 'quick-radius' || action === 'quick-padding' || action === 'quick-color') {
      if (!selected) { status.textContent = 'Seleciona primeiro um elemento com Pick.'; return; }
      const current = currentComputed(selected);
      if (action === 'quick-radius') applyProperty('border-radius', `${Math.min(24, (Number.parseFloat(current['border-radius']) || 0) + 4)}px`);
      if (action === 'quick-padding') applyProperty('padding', `${Math.min(64, (Number.parseFloat(current.padding) || 0) + 4)}px`);
      if (action === 'quick-color') applyProperty('background-color', accent);
      status.textContent = 'Preview atualizado. Podes reverter ou exportar o diff.';
      return;
    }
    if (action === 'quick-reset') {
      if (selected) {
        const original = originals.get(selected);
        const before = captureAttributes(selected);
        if (original) restoreElement(selected, original);
        recordHistory(selected, before, 'reset');
        selectElement(selected);
        status.textContent = 'Preview restaurado. Podes desfazer esta ação.';
      }
      return;
    }
    if (action === 'undo') { undoPreview(); return; }
    if (action === 'redo') { redoPreview(); return; }
    if (action === 'unlock') {
      selected = null;
      highlighted = null;
      options.onSelectionChange?.(null);
      selectionLocked = false;
      resizeObserver?.disconnect();
      resizeObserver?.observe(doc.documentElement);
      panel.hidden = true;
      highlight.style.display = 'none';
      tag.style.display = 'none';
      return;
    }
    if (action === 'reset' && selected) {
      const original = originals.get(selected);
      const before = captureAttributes(selected);
      if (original) restoreElement(selected, original);
      recordHistory(selected, before, 'reset');
      selectElement(selected);
      status.textContent = 'Pré-visualização deste elemento revertida.';
      notifyChanges();
      return;
    }
    if (action === 'apply') {
      const changes = buildChangeSets();
      if (!changes.length) {
        status.textContent = 'Ainda não existem alterações para exportar.';
        return;
      }
      const prompt = synthesizeLivePrompt(changes);
      options.onApply?.(changes, prompt);
      const clipboard = view.navigator.clipboard;
      if (clipboard?.writeText) {
        void clipboard.writeText(prompt).then(
          () => { status.textContent = 'Diff e prompt copiados. O código-fonte permanece intacto.'; },
          () => { status.textContent = 'Diff gerado. O browser bloqueou a cópia automática; use o callback onApply.'; },
        );
      } else {
        status.textContent = 'Diff gerado e entregue ao callback onApply. Clipboard indisponível.';
      }
    }
  };

  function undoPreview(): void {
    const operation = history.undo();
    if (!operation) return;
    restoreElementAttributes(operation.target, operation.snapshot);
    selectElement(operation.target as HTMLElement | SVGElement);
    status.textContent = `Desfeito: ${operation.label}.`;
    refreshHistoryControls();
    notifyChanges();
  }

  function redoPreview(): void {
    const operation = history.redo();
    if (!operation) return;
    restoreElementAttributes(operation.target, operation.snapshot);
    selectElement(operation.target as HTMLElement | SVGElement);
    status.textContent = `Refeito: ${operation.label}.`;
    refreshHistoryControls();
    notifyChanges();
  }

  function stop(stopOptions: { restore?: boolean } = {}): void {
    if (stopped) return;
    stopped = true;
    doc.removeEventListener('pointermove', onPointerMove, true);
    doc.removeEventListener('click', onClick, true);
    doc.removeEventListener('keydown', onKeyDown, true);
    doc.removeEventListener('scroll', scheduleGeometryUpdate, true);
    view.removeEventListener('resize', scheduleGeometryUpdate);
    view.visualViewport?.removeEventListener('resize', scheduleGeometryUpdate);
    view.visualViewport?.removeEventListener('scroll', scheduleGeometryUpdate);
    resizeObserver?.disconnect();
    if (geometryFrame) view.cancelAnimationFrame(geometryFrame);
    if (pointerFrame) view.cancelAnimationFrame(pointerFrame);
    pendingPointerTarget = null;
    shadow.removeEventListener('input', onInput);
    shadow.removeEventListener('click', onPanelClick);
    if (stopOptions.restore !== false) {
      for (const [element, original] of originals) restoreElement(element, original);
    }
    host.remove();
    options.onSelectionChange?.(null);
    options.onChange?.([]);
    if (previouslyFocused?.isConnected) previouslyFocused.focus();
  }

  function setActive(value: boolean): void {
    if (stopped) return;
    enabled = value;
    const activePanel = panel!;
    const activeHighlight = highlight!;
    const activeTag = tag!;
    activePanel.hidden = !enabled || !selected;
    if (!enabled) {
      activeHighlight.style.display = 'none';
      activeTag.style.display = 'none';
    } else if (selected) {
      positionHighlight(selected);
    }
  }

  resizeObserver = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(scheduleGeometryUpdate)
    : null;
  resizeObserver?.observe(doc.documentElement);

  shadow.addEventListener('input', onInput);
  shadow.addEventListener('click', onPanelClick);
  doc.addEventListener('pointermove', onPointerMove, true);
  doc.addEventListener('click', onClick, true);
  doc.addEventListener('keydown', onKeyDown, true);
  doc.addEventListener('scroll', scheduleGeometryUpdate, true);
  view.addEventListener('resize', scheduleGeometryUpdate);
  view.visualViewport?.addEventListener('resize', scheduleGeometryUpdate);
  view.visualViewport?.addEventListener('scroll', scheduleGeometryUpdate);
  doc.body.append(host);
  panel.hidden = !enabled;
  refreshHistoryControls();

  const notifyChanges = (): void => options.onChange?.(buildChangeSets());

  return {
    isActive: () => enabled && !stopped,
    setActive,
    getSelectedElement: () => selected,
    getChangeSets: buildChangeSets,
    getPrompt: () => synthesizeLivePrompt(buildChangeSets()),
    stop,
  };
}
