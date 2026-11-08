import { auditTextContrast } from '../refinement/audits/contrast-audit.js';
import { buildElementSelector, getElementLabel } from './selector.js';
import type { IntegraInspectorController, IntegraInspectorOptions } from './types.js';

interface Snapshot { className: string | null; style: string | null }

const BLUE = '#3B82F6';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * Browser-only visual editor. It previews DOM changes and exports a diff;
 * it does not write source files, execute shell commands or contact an AI provider.
 */
export function startIntegraInspector(options: IntegraInspectorOptions = {}): IntegraInspectorController {
  if (typeof window === 'undefined' || typeof document === 'undefined') throw new Error('Live Inspector requires a browser.');
  if (!options.allowRemote && !LOCAL_HOSTS.has(window.location.hostname)) {
    throw new Error('Integra Live Inspector is restricted to localhost development previews.');
  }
  if (document.getElementById('integra-inspector-ui')) throw new Error('Integra Live Inspector is already active.');

  const host = document.createElement('div');
  host.id = 'integra-inspector-ui';
  host.setAttribute('data-integra-ignore', '');
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      :host{all:initial;color:#f4f4f5;font:13px/1.45 Inter,system-ui,sans-serif}
      *{box-sizing:border-box}
      .outline{position:fixed;z-index:2147483000;pointer-events:none;border:2px solid ${BLUE};background:#3b82f612;box-shadow:0 0 0 1px #fff7;display:none}
      .tag{position:fixed;z-index:2147483001;pointer-events:none;background:${BLUE};color:white;border-radius:4px;padding:2px 7px;font:11px/1.5 ui-monospace,monospace;display:none}
      .panel{position:fixed;z-index:2147483002;right:16px;top:16px;width:min(340px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;background:#09090b;border:1px solid #27272a;border-radius:12px;box-shadow:0 16px 50px #0009;padding:14px}
      header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
      h2{font-size:14px;margin:0;font-weight:700;letter-spacing:-.02em}
      .muted{color:#a1a1aa;font-size:11px;overflow-wrap:anywhere;margin:5px 0 12px}
      label{display:block;color:#d4d4d8;font-size:11px;margin:10px 0 5px}
      input,textarea{width:100%;background:#18181b;color:#fafafa;border:1px solid #3f3f46;border-radius:6px;padding:7px;font:12px ui-monospace,monospace}
      input[type=color]{height:34px;padding:2px}
      .pair{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      button{background:#18181b;color:#fafafa;border:1px solid #3f3f46;border-radius:7px;padding:7px 9px;font:12px Inter,system-ui;cursor:pointer}
      button.primary{background:${BLUE};border-color:${BLUE}}
      button:disabled{opacity:.4;cursor:not-allowed}
      .actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px}
      .contrast{border:1px solid #3f3f46;border-radius:7px;padding:9px;margin-top:12px}
      .contrast strong{display:block;font-size:12px}
      .status{margin-top:9px;min-height:18px;color:#a1a1aa;font-size:11px}
      .status[data-kind=error]{color:#fca5a5}.status[data-kind=success]{color:#86efac}
    </style>
    <div class="outline"></div><div class="tag"></div>
    <section class="panel" role="dialog" aria-label="Integra Live Inspector">
      <header><h2>Integra · Live Inspector</h2><button id="close" aria-label="Fechar inspector">×</button></header>
      <div id="name">Nenhum elemento selecionado</div><div id="meta" class="muted">Passa o rato e clica num elemento.</div>
      <button id="pick" class="primary">Selecionar elemento</button> <button id="parent" disabled>↑ Pai</button>
      <label for="classes">Classes / Tailwind</label><textarea id="classes" rows="3" spellcheck="false"></textarea>
      <div class="pair"><div><label for="fg">Texto</label><input id="fg" type="color" value="#ffffff"></div><div><label for="bg">Fundo</label><input id="bg" type="color" value="#111111"></div></div>
      <div class="pair"><div><label for="font">Tamanho (px)</label><input id="font" type="number" min="8" max="96"></div><div><label for="padding">Padding (px)</label><input id="padding" type="number" min="0" max="96"></div></div>
      <label for="radius">Border radius (px)</label><input id="radius" type="number" min="0" max="48">
      <div class="contrast" id="contrast" aria-live="polite">O contraste será calculado ao selecionar texto.</div>
      <div class="actions"><button id="reset">Repor elemento</button><button id="copy" class="primary">Copiar DOM diff</button></div>
      <div class="status" id="status" role="status"></div>
      <div class="muted">Preview temporário no DOM. O diff não altera ficheiros e deve ser revisto pelo agente.</div>
    </section>`;
  document.body.append(host);

  const root = shadow;
  const byId = <T extends HTMLElement>(id: string) => {
    const node = root.getElementById(id);
    if (!node) throw new Error(`Missing inspector control: ${id}`);
    return node as T;
  };
  const outline = byId<HTMLDivElement>('outline');
  const badge = byId<HTMLDivElement>('tag');
  const panel = byId<HTMLElement>('name');
  const meta = byId<HTMLElement>('meta');
  const pick = byId<HTMLButtonElement>('pick');
  const parentButton = byId<HTMLButtonElement>('parent');
  const classes = byId<HTMLTextAreaElement>('classes');
  const fg = byId<HTMLInputElement>('fg');
  const bg = byId<HTMLInputElement>('bg');
  const font = byId<HTMLInputElement>('font');
  const padding = byId<HTMLInputElement>('padding');
  const radius = byId<HTMLInputElement>('radius');
  const contrast = byId<HTMLDivElement>('contrast');
  const status = byId<HTMLDivElement>('status');
  const snapshots = new Map<HTMLElement, Snapshot>();
  let selected: HTMLElement | null = null;
  let hovered: HTMLElement | null = null;
  let enabled = options.enabled ?? true;
  let destroyed = false;

  const say = (message: string, kind = 'normal') => { status.textContent = message; status.dataset.kind = kind; };
  const snapshot = (element: HTMLElement): Snapshot => {
    let saved = snapshots.get(element);
    if (!saved) {
      saved = { className: element.getAttribute('class'), style: element.getAttribute('style') };
      snapshots.set(element, saved);
    }
    return saved;
  };
  const overlay = (element: HTMLElement | null) => {
    if (!element?.isConnected) { outline.style.display = 'none'; badge.style.display = 'none'; return; }
    const rect = element.getBoundingClientRect();
    outline.style.display = 'block'; outline.style.left = `${Math.max(0, rect.left)}px`;
    outline.style.top = `${Math.max(0, rect.top)}px`; outline.style.width = `${Math.max(0, rect.width)}px`;
    outline.style.height = `${Math.max(0, rect.height)}px`;
    badge.style.display = 'block'; badge.style.left = `${Math.max(6, rect.left)}px`;
    badge.style.top = `${Math.max(6, rect.top - 24)}px`;
    badge.textContent = `${element.tagName.toLowerCase()} · ${getElementLabel(element)}`;
  };
  const refreshContrast = (element: HTMLElement) => {
    const result = auditTextContrast(element, window);
    contrast.replaceChildren();
    const heading = document.createElement('strong');
    heading.textContent = result.ratio === undefined ? result.status.toUpperCase() : `${result.ratio.toFixed(2)}:1 · ${result.status.toUpperCase()}`;
    const detail = document.createElement('div'); detail.className = 'muted'; detail.textContent = result.message;
    contrast.append(heading, detail);
  };
  const refresh = (element: HTMLElement) => {
    snapshot(element); selected = element;
    panel.textContent = `${getElementLabel(element)} · <${element.tagName.toLowerCase()}>`;
    meta.textContent = `${buildElementSelector(element)} · ${element.getAttribute('data-integra-file') ?? 'ficheiro não identificado'}`;
    classes.value = element.getAttribute('class') ?? '';
    const css = getComputedStyle(element);
    const toHex = (value: string, fallback: string) => /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
    fg.value = toHex(css.color, '#ffffff');
    bg.value = toHex(css.backgroundColor, '#111111');
    font.value = String(Math.round(parseFloat(css.fontSize) || 16));
    padding.value = String(Math.round(parseFloat(css.paddingTop) || 0));
    radius.value = String(Math.round(parseFloat(css.borderTopLeftRadius) || 0));
    parentButton.disabled = !element.parentElement || ['BODY', 'HTML'].includes(element.parentElement.tagName);
    refreshContrast(element); overlay(element);
  };
  const targetFrom = (event: Event): HTMLElement | null => {
    if (host.contains(event.target as Node)) return null;
    const found = event.composedPath().find((item) => item instanceof HTMLElement && !host.contains(item));
    const element = found instanceof HTMLElement ? found : null;
    if (!element || ['BODY', 'HTML'].includes(element.tagName) || element.closest('[data-integra-ignore]')) return null;
    return element;
  };
  const onMove = (event: PointerEvent) => {
    if (!enabled || destroyed) return;
    hovered = targetFrom(event); overlay(hovered);
  };
  const onClick = (event: MouseEvent) => {
    if (!enabled || destroyed) return;
    const element = targetFrom(event); if (!element) return;
    event.preventDefault(); event.stopImmediatePropagation();
    enabled = false; pick.textContent = 'Selecionar elemento'; pick.classList.remove('primary');
    refresh(element); say('Elemento bloqueado. Altera os controlos e copia o diff.');
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'i') {
      event.preventDefault(); controller.setEnabled(!enabled);
    } else if (event.key === 'Escape' && enabled) controller.setEnabled(false);
  };
  const setStyle = (property: string, value: string) => {
    if (!selected) return say('Seleciona primeiro um elemento.', 'error');
    selected.style.setProperty(property, value, 'important'); refreshContrast(selected);
  };
  classes.addEventListener('input', () => { if (selected) { selected.className = classes.value; overlay(selected); } });
  fg.addEventListener('input', () => setStyle('color', fg.value));
  bg.addEventListener('input', () => setStyle('background-color', bg.value));
  const numberStyle = (input: HTMLInputElement, property: string, min: number, max: number) => {
    const value = Number(input.value);
    if (Number.isFinite(value) && value >= min && value <= max) setStyle(property, `${value}px`);
    else say(`Valor permitido: ${min}–${max}px.`, 'error');
  };
  font.addEventListener('change', () => numberStyle(font, 'font-size', 8, 96));
  padding.addEventListener('change', () => numberStyle(padding, 'padding', 0, 96));
  radius.addEventListener('change', () => numberStyle(radius, 'border-radius', 0, 48));

  byId<HTMLButtonElement>('reset').addEventListener('click', () => {
    if (!selected) return say('Seleciona primeiro um elemento.');
    const saved = snapshot(selected);
    if (saved.className === null) selected.removeAttribute('class'); else selected.setAttribute('class', saved.className);
    if (saved.style === null) selected.removeAttribute('style'); else selected.setAttribute('style', saved.style);
    refresh(selected); say('Preview reposto.', 'success');
  });
  parentButton.addEventListener('click', () => {
    const parent = selected?.parentElement;
    if (!parent || ['BODY', 'HTML'].includes(parent.tagName) || parent.closest('[data-integra-ignore]')) return;
    refresh(parent); say('Elemento pai selecionado.');
  });
  byId<HTMLButtonElement>('copy').addEventListener('click', async () => {
    if (!selected) return say('Seleciona primeiro um elemento.', 'error');
    const saved = snapshot(selected);
    const diff = [
      '### INTEGRA LIVE DOM DIFF',
      `- Selector: ${buildElementSelector(selected)}`,
      `- Component: ${getElementLabel(selected)}`,
      `- Source hint: ${selected.getAttribute('data-integra-file') ?? 'unknown'}`,
      `- Original classes: ${JSON.stringify(saved.className ?? '')}`,
      `- Updated classes: ${JSON.stringify(selected.getAttribute('class') ?? '')}`,
      `- Original style: ${JSON.stringify(saved.style ?? '')}`,
      `- Updated style: ${JSON.stringify(selected.getAttribute('style') ?? '')}`,
      '- Apply only after locating and reviewing the actual source component. This browser preview does not write source files.',
    ].join('\n');
    try { await navigator.clipboard.writeText(diff); options.onPatch?.(diff); say('DOM diff copiado para o clipboard.', 'success'); }
    catch { say('Clipboard indisponível. Usa localhost/HTTPS e concede permissão.', 'error'); }
  });
  byId<HTMLButtonElement>('close').addEventListener('click', () => controller.destroy());
  pick.addEventListener('click', () => controller.setEnabled(!enabled));

  const onScroll = () => overlay(enabled ? hovered : selected);
  document.addEventListener('pointermove', onMove, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKey, true);
  window.addEventListener('scroll', onScroll, true);
  window.addEventListener('resize', onScroll);

  const controller: IntegraInspectorController = {
    setEnabled(value) {
      if (destroyed) return;
      enabled = value; pick.textContent = enabled ? 'A clicar…' : 'Selecionar elemento';
      pick.classList.toggle('primary', enabled);
      say(enabled ? 'Passa o rato sobre um elemento e clica para selecionar.' : 'Seleção pausada.');
      overlay(enabled ? hovered : selected);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      for (const [element, saved] of snapshots) {
        if (!element.isConnected) continue;
        if (saved.className === null) element.removeAttribute('class'); else element.setAttribute('class', saved.className);
        if (saved.style === null) element.removeAttribute('style'); else element.setAttribute('style', saved.style);
      }
      host.remove();
    },
  };
  controller.setEnabled(enabled);
  return controller;
}

export type { IntegraInspectorController, IntegraInspectorOptions } from './types.js';
