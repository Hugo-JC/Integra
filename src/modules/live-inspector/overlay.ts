import { calculateLiveContrast } from './contrast.js';
import { colorToHex, parseCssColor, compositeColors } from './color.js';
import { createElementChangeSet, synthesizeLivePrompt } from './diff.js';
import { getAccessibleName, findUniqueSelector } from './selector.js';
import type { IntegraLiveInspectorController, IntegraLiveInspectorOptions, LiveEditableProperty, LiveElementChangeSet, LiveElementSnapshot } from './types.js';

interface OriginalElementState {
  snapshot: LiveElementSnapshot;
  originalStyleAttribute: string | null;
  originalClasses: string;
  originalComputedStyles: Record<string, string>;
}

const EDITABLE_PROPERTIES: LiveEditableProperty[] = ['color', 'background-color', 'border-radius', 'padding'];

function isElement(value: EventTarget | null): value is Element {
  return Boolean(value && (value as Node).nodeType === 1);
}

function hasTransparentBackground(value: string): boolean {
  const color = parseCssColor(value);
  return !color || color.alpha < 0.999;
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
    ...(sourceHint ? { componentHint: sourceHint } : {}),
  };
}

/**
 * Browser-only opt-in inspector. Edits are temporary DOM previews; this module
 * never writes application source files or contacts an AI provider.
 */
export function createIntegraInspector(options: IntegraLiveInspectorOptions = {}): IntegraLiveInspectorController {
  if (typeof document === 'undefined') throw new Error('Integra Live Inspector requires a browser document.');
  const doc = document;
  const view = doc.defaultView;
  if (!view) throw new Error('Integra Live Inspector requires an active browser window.');
  if (!doc.body) throw new Error('Integra Live Inspector must start after document.body is available.');

  const host = doc.createElement('div');
  host.id = 'integra-inspector-ui';
  host.setAttribute('data-integra-inspector', 'true');
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      :host { all: initial; color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      * { box-sizing: border-box; }
      #highlight { position: fixed; display: none; border: 2px solid #3B82F6; border-radius: 3px; background: rgba(59,130,246,.07); pointer-events: none; }
      #tag { position: fixed; display: none; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 4px 7px; border-radius: 5px 5px 5px 0; color: #fff; background: #2563EB; font: 11px/1.2 ui-monospace, monospace; pointer-events: none; }
      #panel { position: fixed; top: 16px; right: 16px; width: min(360px, calc(100vw - 32px)); max-height: calc(100vh - 32px); overflow: auto; padding: 16px; border: 1px solid #30343b; border-radius: 12px; color: #f4f6f8; background: #0d1016; box-shadow: 0 16px 50px rgba(0,0,0,.4); pointer-events: auto; font-size: 13px; }
      #panel[hidden] { display:none; }
      .head { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px; }
      .brand { display:flex; align-items:center; gap:8px; font-weight:700; letter-spacing:-.02em; }
      .mark { width:9px; height:9px; border-radius:3px; background:#3B82F6; box-shadow:0 0 0 3px rgba(59,130,246,.16); }
      button { border:1px solid #343b46; border-radius:7px; background:#171c25; color:#f4f6f8; padding:7px 10px; cursor:pointer; font:inherit; }
      button:hover { border-color:#3B82F6; }
      button.primary { border-color:#2563EB; background:#2563EB; }
      label { display:block; margin:12px 0 5px; color:#abb4c2; font-size:11px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; }
      input { width:100%; min-width:0; border:1px solid #343b46; border-radius:7px; padding:8px; background:#141922; color:#f4f6f8; font:12px ui-monospace,monospace; }
      input[type=color] { height:36px; padding:3px; }
      .grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
      .muted { color:#9ba5b4; font-size:11px; line-height:1.5; overflow-wrap:anywhere; }
      .target { padding:9px; background:#141922; border:1px solid #272f3b; border-radius:8px; overflow-wrap:anywhere; }
      .contrast { margin-top:12px; padding:9px; border-radius:8px; background:#141922; border:1px solid #303846; line-height:1.5; }
      .actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
      #status { min-height:16px; margin-top:10px; color:#93c5fd; font-size:11px; }
      .rule { border:0; border-top:1px solid #252d38; margin:14px 0; }
      #instructions { margin:0 0 12px; color:#aeb7c4; font-size:11px; line-height:1.5; }
    </style>
    <div id="highlight" aria-hidden="true"></div>
    <div id="tag" aria-hidden="true"></div>
    <section id="panel" role="dialog" aria-label="Integra Live Inspector">
      <div class="head"><div class="brand"><span class="mark"></span><span id="title">Integra Live Inspector</span></div><button type="button" data-action="close" aria-label="Fechar inspector">Fechar</button></div>
      <p id="instructions">Passe o rato sobre um elemento e clique para o selecionar. As alterações são pré-visualizações temporárias no DOM.</p>
      <div class="target"><strong id="target-name">Nenhum elemento selecionado</strong><div id="target-selector" class="muted">Aguardando seleção…</div></div>
      <label for="classes">Classes do elemento</label>
      <input id="classes" data-field="classes" type="text" spellcheck="false" autocomplete="off" placeholder="className / Tailwind utilities">
      <div class="grid">
        <div><label for="text-color">Cor do texto</label><input id="text-color" data-field="color" type="color" value="#ffffff"></div>
        <div><label for="surface-color">Cor de fundo</label><input id="surface-color" data-field="background-color" type="color" value="#111111"></div>
        <div><label for="radius">Border radius (px)</label><input id="radius" data-field="border-radius" type="number" min="0" max="64" step="1"></div>
        <div><label for="padding">Padding (px)</label><input id="padding" data-field="padding" type="number" min="0" max="128" step="1"></div>
      </div>
      <div class="contrast" id="contrast" aria-live="polite">O contraste será calculado após selecionar um elemento.</div>
      <hr class="rule">
      <div class="muted">A seleção usa o azul Integra #3B82F6. O tema da interface analisada não é alterado automaticamente.</div>
      <div class="actions"><button type="button" data-action="unlock">Escolher outro</button><button type="button" data-action="reset">Reverter elemento</button><button type="button" class="primary" data-action="apply">Gerar diff + prompt</button></div>
      <div id="status" role="status" aria-live="polite"></div>
    </section>
  `;

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
  title.textContent = options.title ?? 'Integra Live Inspector';

  const originals = new Map<Element, OriginalElementState>();
  let selected: HTMLElement | SVGElement | null = null;
  let highlighted: Element | null = null;
  let selectionLocked = false;
  let stopped = false;
  let geometryFrame = 0;
  let resizeObserver: ResizeObserver | null = null;

  const isInspectorEvent = (event: Event): boolean => event.composedPath().includes(host);
  const isInspectable = (element: Element): element is HTMLElement | SVGElement => {
    const ignored = new Set(['HTML', 'BODY', 'SCRIPT', 'STYLE', 'LINK', 'META', 'HEAD']);
    return !ignored.has(element.tagName)
      && 'style' in element
      && !element.closest('[data-integra-inspector="true"], [data-integra-ignore]');
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
    contrastOutput.textContent = `Contraste ${result.ratio}:1 · WCAG AA ${result.passesAA ? 'passou' : 'não passou'} (mínimo ${result.requiredRatio}:1)${result.isLargeText ? ' · texto grande' : ''}.`;
    contrastOutput.style.borderColor = result.passesAA ? '#2563EB' : '#B45309';
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
        originalClasses: element.getAttribute('class') ?? '',
        originalComputedStyles: currentComputed(element),
      });
    }
    const original = originals.get(element);
    if (!original) return;
    const values = currentComputed(element);
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
    panel.hidden = false;
    status.textContent = 'Elemento selecionado. As alterações ainda não foram escritas no código-fonte.';
  };

  const applyProperty = (property: LiveEditableProperty, value: string): void => {
    if (!selected) return;
    selected.style.setProperty(property, value, 'important');
    updateContrast(selected);
    positionHighlight(selected);
  };

  const restoreElement = (element: Element, original: OriginalElementState): void => {
    if (original.originalClasses) element.setAttribute('class', original.originalClasses);
    else element.removeAttribute('class');
    if (original.originalStyleAttribute === null) element.removeAttribute('style');
    else element.setAttribute('style', original.originalStyleAttribute);
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
    if (stopped || selectionLocked || isInspectorEvent(event)) return;
    const candidate = event.composedPath().find(isElement);
    if (candidate && isInspectable(candidate)) positionHighlight(candidate);
  };

  const onClick = (event: MouseEvent): void => {
    if (stopped || selectionLocked || isInspectorEvent(event)) return;
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
      if (target.value.trim()) selected.setAttribute('class', target.value);
      else selected.removeAttribute('class');
      positionHighlight(selected);
      return;
    }
    if (property && EDITABLE_PROPERTIES.includes(property as LiveEditableProperty)) {
      const unit = property === 'border-radius' || property === 'padding' ? 'px' : '';
      const numeric = unit ? Number(target.value) : Number.NaN;
      if (unit && (!Number.isFinite(numeric) || numeric < 0 || numeric > 512)) return;
      applyProperty(property as LiveEditableProperty, `${target.value}${unit}`);
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
    if (action === 'unlock') {
      selected = null;
      selectionLocked = false;
      panel.hidden = true;
      highlight.style.display = 'none';
      tag.style.display = 'none';
      return;
    }
    if (action === 'reset' && selected) {
      const original = originals.get(selected);
      if (original) restoreElement(selected, original);
      selectElement(selected);
      status.textContent = 'Pré-visualização deste elemento revertida.';
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

  function stop(stopOptions: { restore?: boolean } = {}): void {
    if (stopped) return;
    stopped = true;
    doc.removeEventListener('pointermove', onPointerMove, true);
    doc.removeEventListener('click', onClick, true);
    doc.removeEventListener('scroll', scheduleGeometryUpdate, true);
    view.removeEventListener('resize', scheduleGeometryUpdate);
    view.visualViewport?.removeEventListener('resize', scheduleGeometryUpdate);
    view.visualViewport?.removeEventListener('scroll', scheduleGeometryUpdate);
    resizeObserver?.disconnect();
    if (geometryFrame) view.cancelAnimationFrame(geometryFrame);
    shadow.removeEventListener('input', onInput);
    shadow.removeEventListener('click', onPanelClick);
    if (stopOptions.restore !== false) {
      for (const [element, original] of originals) restoreElement(element, original);
    }
    host.remove();
  }

  resizeObserver = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(scheduleGeometryUpdate)
    : null;
  resizeObserver?.observe(doc.documentElement);

  shadow.addEventListener('input', onInput);
  shadow.addEventListener('click', onPanelClick);
  doc.addEventListener('pointermove', onPointerMove, true);
  doc.addEventListener('click', onClick, true);
  doc.addEventListener('scroll', scheduleGeometryUpdate, true);
  view.addEventListener('resize', scheduleGeometryUpdate);
  view.visualViewport?.addEventListener('resize', scheduleGeometryUpdate);
  view.visualViewport?.addEventListener('scroll', scheduleGeometryUpdate);
  doc.body.append(host);
  panel.hidden = false;

  return { getChangeSets: buildChangeSets, getPrompt: () => synthesizeLivePrompt(buildChangeSets()), stop };
}
