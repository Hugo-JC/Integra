import { evaluateContrast, contrastRatio, parseColor, relativeLuminance, toHexColor } from './contrast.js';
import type { LiveInspectorHandle, LiveInspectorOptions, LiveInspectorPatch, LiveStyleProperty, LiveStyleChange } from './types.js';

const PROPERTIES: LiveStyleProperty[] = ['background-color','color','border-radius','padding'];
const OMIT = new Set(['HTML','BODY','HEAD','SCRIPT','STYLE','LINK','META','TITLE']);
const BLUE = '#3B82F6';
type Saved = { value: string; priority: string; computed: string };

function labelOf(el: HTMLElement): string {
  const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>'.'+x).join('') : '';
  return (el.tagName.toLowerCase() + (el.id ? '#'+el.id : '') + cls).slice(0,90);
}
function nameOf(el: HTMLElement): string | undefined {
  const aria = el.getAttribute('aria-label') || el.getAttribute('title');
  const text = aria || el.innerText?.trim().replace(/\s+/g,' ');
  return text ? text.slice(0,120) : undefined;
}
function opaque(value: string): boolean {
  if (value === 'transparent') return false;
  const alpha = value.match(/^rgba?\([^)]*[,/]\s*([\d.]+%?)\s*\)$/i)?.[1];
  return alpha === undefined || (alpha.endsWith('%') ? Number.parseFloat(alpha) >= 99.9 : Number.parseFloat(alpha) >= 0.999);
}
function backgroundOf(el: HTMLElement): string {
  let item: HTMLElement | null = el;
  while (item) {
    const bg = getComputedStyle(item).backgroundColor;
    if (bg && opaque(bg) && parseColor(bg)) return bg;
    item = item.parentElement;
  }
  return '#ffffff';
}
function safeLength(value: string): boolean { return value === '0' || /^-?(?:\d+|\d*\.\d+)(?:px|rem|em|%)$/.test(value.trim()); }

export function createLiveInspector(options: LiveInspectorOptions = {}): LiveInspectorHandle {
  if (typeof window === 'undefined' || typeof document === 'undefined') throw new Error('Integra Live Inspector requires a browser.');
  const requestedAccent = options.accentColor ?? BLUE;
  const accent = typeof CSS !== 'undefined' && CSS.supports('color', requestedAccent) ? requestedAccent : BLUE;
  if (options.ignoreSelector) {
    try {
      document.createElement('div').matches(options.ignoreSelector);
    } catch {
      throw new TypeError('Integra Live Inspector received an invalid ignoreSelector CSS selector.');
    }
  }
  const host = document.createElement('div');
  host.id = 'integra-inspector-ui';
  host.setAttribute('data-integra-ignore','');
  const shadow = host.attachShadow({mode:'open'});
  shadow.innerHTML = `
<style>
:host{all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;color:#f4f4f5;font:12px/1.45 Inter,system-ui,sans-serif}
*{box-sizing:border-box}#outline{position:fixed;display:none;border:2px solid ${accent};border-radius:3px;pointer-events:none;box-shadow:0 0 0 1px #3b82f633}
#tag{position:absolute;left:-1px;top:-22px;background:${accent};color:white;padding:3px 6px;font:600 10px ui-monospace,monospace}
#panel{position:fixed;right:16px;top:16px;width:min(350px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;pointer-events:auto;background:#09090b;border:1px solid #27272a;border-radius:12px;box-shadow:0 18px 60px #0006}
#panel[hidden]{display:none}.top{display:flex;justify-content:space-between;padding:12px;border-bottom:1px solid #27272a;font-weight:700}
.body{padding:12px;display:grid;gap:11px}.muted{color:#a1a1aa}.target{font:600 11px ui-monospace;overflow-wrap:anywhere}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.field{display:grid;gap:5px}.field label{color:#a1a1aa;font-size:10px;text-transform:uppercase}
input,textarea,button{font:inherit;color:#fafafa;background:#18181b;border:1px solid #3f3f46;border-radius:6px;padding:7px}
input[type=color]{width:100%;height:32px;padding:2px}textarea{min-height:70px;resize:vertical;font:11px ui-monospace}
button{cursor:pointer}.primary{background:${accent};border-color:${accent};font-weight:700}.actions{display:flex;justify-content:space-between;gap:8px}
button:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid ${accent};outline-offset:2px}
.contrast{padding:8px;background:#111113;border:1px solid #27272a;border-radius:8px;display:flex;justify-content:space-between;gap:8px}
</style>
<div id="outline" aria-hidden="true"><span id="tag"></span></div>
<aside id="panel" role="dialog" aria-label="Integra Live Inspector">
<header class="top"><span id="panel-title">Integra Live Inspector</span><button id="close" type="button">Esc</button></header>
<div class="body">
<div><div class="muted">Elemento selecionado</div><div id="target" class="target">Passe o rato e clique num elemento.</div></div>
<div class="grid">
<div class="field"><label for="bg">Fundo</label><input id="bg" type="color" value="#ffffff"></div>
<div class="field"><label for="fg">Texto</label><input id="fg" type="color" value="#18181b"></div>
<div class="field"><label for="radius">Raio</label><input id="radius" value="8px"></div>
<div class="field"><label for="padding">Padding</label><input id="padding" value="16px"></div>
</div>
<div class="field"><label for="classes">Classes (ex.: Tailwind)</label><textarea id="classes" spellcheck="false"></textarea></div>
<div class="contrast"><div><div class="muted">Contraste estimado</div><div id="status" class="muted">Selecione um elemento</div></div><strong id="ratio">—</strong></div>
<div class="actions"><button id="revert" type="button">Reverter</button><button id="export" class="primary" type="button">Gerar prompt + diff</button></div>
<div class="muted">Preview temporário; o código-fonte só muda após aplicação e validação pelo agente.</div>
</div></aside>`;
  document.documentElement.appendChild(host);
  const q = <T extends HTMLElement>(selector:string) => shadow.querySelector<T>(selector)!;
  const outline=q<HTMLDivElement>('#outline'), tag=q<HTMLSpanElement>('#tag'), panel=q<HTMLElement>('#panel'), targetLabel=q<HTMLElement>('#target');
  q<HTMLElement>('#panel-title').textContent = options.panelTitle ?? 'Integra Live Inspector';
  const bg=q<HTMLInputElement>('#bg'), fg=q<HTMLInputElement>('#fg'), radius=q<HTMLInputElement>('#radius'), padding=q<HTMLInputElement>('#padding'), classes=q<HTMLTextAreaElement>('#classes');
  const ratio=q<HTMLElement>('#ratio'), status=q<HTMLElement>('#status');
  let active=options.enabled ?? true, hovered:HTMLElement|null=null, selected:HTMLElement|null=null;
  let originalClass:string|null=null, nextClass='', saved=new Map<LiveStyleProperty,Saved>(), after=new Map<LiveStyleProperty,string>();

  const snapshot=(el:HTMLElement) => {
    const map=new Map<LiveStyleProperty,Saved>();
    for(const prop of PROPERTIES) map.set(prop,{value:el.style.getPropertyValue(prop),priority:el.style.getPropertyPriority(prop),computed:getComputedStyle(el).getPropertyValue(prop)});
    return map;
  };
  const draw=(el:HTMLElement|null) => {
    if(!el){outline.style.display='none';return;}
    const r=el.getBoundingClientRect();
    Object.assign(outline.style,{display:'block',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
    tag.textContent=labelOf(el);
  };
  const ignored=(el:HTMLElement) => el===host || OMIT.has(el.tagName) || !!el.closest('[data-integra-ignore]') || !!options.ignoreSelector && el.matches(options.ignoreSelector);
  const find=(event:Event):HTMLElement|null => {
    const path=event.composedPath();
    if(path.includes(host)) return null;
    for(const node of path) if(node instanceof HTMLElement && !ignored(node)) return node;
    return event.target instanceof HTMLElement && !ignored(event.target) ? event.target : null;
  };
  const currentContrast=() => selected ? evaluateContrast(getComputedStyle(selected).color,backgroundOf(selected)) : null;
  const updateContrast=() => {
    const c=currentContrast();
    ratio.textContent=c ? c.ratio.toFixed(2)+':1' : '—';
    status.textContent=c ? (c.aaNormal ? 'AA normal passa' : 'AA normal não passa')+' · AAA '+(c.aaaNormal?'passa':'não passa') : 'Cores não interpretáveis';
    status.style.color=c?.aaNormal ? '#86efac' : '#fbbf24';
  };
  const patch=():LiveInspectorPatch|null => {
    if(!selected) return null;
    const styleChanges:LiveStyleChange[]=[];
    for(const prop of PROPERTIES) if(after.has(prop)){
      const before=saved.get(prop)?.computed ?? '', value=selected.style.getPropertyValue(prop);
      if(before!==value) styleChanges.push({property:prop,before,after:value});
    }
    const contrast=currentContrast();
    const source=selected.getAttribute('data-integra-source');
    return {
      schemaVersion:'1.0.0',source:'integra-live-inspector',
      element:{tagName:selected.tagName.toLowerCase(),...(selected.id?{id:selected.id}:{}),...(source?{sourcePath:source}:{}),...(nameOf(selected)?{accessibleName:nameOf(selected)!}:{})},
      classDiff:{originalClasses:originalClass ?? '',updatedClasses:nextClass},
      styleChanges,...(contrast?{contrast}:{}),
      notes:['Browser preview only; source files are unchanged.','Locate the source component and verify responsive and accessible states before applying.']
    };
  };
  const notify=()=>options.onPatchChange?.(patch());
  const restore=()=>{
    if(!selected) return;
    if(originalClass===null) selected.removeAttribute('class'); else selected.setAttribute('class',originalClass);
    for(const [prop,initial] of saved){
      if(initial.value) selected.style.setProperty(prop,initial.value,initial.priority); else selected.style.removeProperty(prop);
    }
    nextClass=originalClass ?? ''; classes.value=nextClass; after.clear(); updateContrast(); notify();
  };
  const select=(el:HTMLElement)=>{
    selected=el; hovered=el; originalClass=el.getAttribute('class'); nextClass=originalClass ?? '';
    saved=snapshot(el); after.clear();
    bg.value=toHexColor(backgroundOf(el)) ?? '#ffffff'; fg.value=toHexColor(getComputedStyle(el).color) ?? '#18181b';
    radius.value=getComputedStyle(el).borderRadius; padding.value=getComputedStyle(el).padding; classes.value=nextClass;
    targetLabel.textContent=labelOf(el)+(el.getAttribute('data-integra-source')?' · '+el.getAttribute('data-integra-source'):'');
    panel.hidden=false; draw(el); updateContrast(); options.onSelectionChange?.(el); notify();
  };
  const apply=(prop:LiveStyleProperty,value:string)=>{
    if(!selected) return;
    if(prop==='background-color'||prop==='color'){
      if(!(typeof CSS!=='undefined'&&CSS.supports('color',value))) return;
    } else if(!safeLength(value)) return;
    selected.style.setProperty(prop,value); after.set(prop,value); updateContrast(); notify();
  };
  const move=(event:PointerEvent)=>{
    if(!active) return; const el=find(event);
    if(!el || el===selected) return; hovered=el; draw(el);
  };
  const click=(event:MouseEvent)=>{
    if(!active) return; const el=find(event);
    if(!el || el===selected) return;
    event.preventDefault(); event.stopImmediatePropagation(); select(el);
  };
  const key=(event:KeyboardEvent)=>{
    if(event.key==='Escape'){setActive(false);return;}
    if(options.keyboardShortcut!==false && event.altKey && event.shiftKey && event.key.toLowerCase()==='i'){
      event.preventDefault();setActive(!active);
    }
  };
  function setActive(value:boolean){active=value;panel.hidden=!active||!selected;if(!active) outline.style.display='none';else if(hovered)draw(hovered);}
  bg.addEventListener('input',()=>apply('background-color',bg.value));
  fg.addEventListener('input',()=>apply('color',fg.value));
  radius.addEventListener('change',()=>apply('border-radius',radius.value.trim()));
  padding.addEventListener('change',()=>apply('padding',padding.value.trim()));
  classes.addEventListener('input',()=>{if(!selected)return;nextClass=classes.value.trim().replace(/\s+/g,' ');selected.setAttribute('class',nextClass);notify();});
  q<HTMLButtonElement>('#close').addEventListener('click',()=>setActive(false));
  q<HTMLButtonElement>('#revert').addEventListener('click',restore);
  q<HTMLButtonElement>('#export').addEventListener('click',()=>{const text=handle.toPrompt();if(text&&navigator.clipboard?.writeText)void navigator.clipboard.writeText(text).catch(()=>{status.textContent='Não foi possível copiar; use getPatch().';});});
  document.addEventListener('pointermove',move,true); document.addEventListener('click',click,true); document.addEventListener('keydown',key,true);
  setActive(active);
  const handle:LiveInspectorHandle={
    isActive:()=>active,setActive,getSelectedElement:()=>selected,getPatch:patch,
    toPrompt:()=>{
      const p=patch(); if(!p)return null;
      const style=p.styleChanges.map(x=>'- '+x.property+': `'+(x.before||'(unset)')+'` → `'+x.after+'`').join('\n')||'- No inline style property changed.';
      return ['## Integra Live Inspector — DOM diff','- Element: `'+p.element.tagName+(p.element.id?'#'+p.element.id:'')+'`','- Source hint: `'+(p.element.sourcePath??'not provided; locate from DOM context')+'`','','### CLASS DIFF','- Original: `'+p.classDiff.originalClasses+'`','- Updated: `'+p.classDiff.updatedClasses+'`','','### STYLE DIFF',style,'','### QUALITY GATE','- Contrast estimate: '+(p.contrast?p.contrast.ratio+':1':'not measurable'),' - Apply only to the real source component; preserve behavior and tokens.','- Run typecheck, tests, responsive and accessibility checks.','- This preview is not proof of WCAG conformance.'].join('\n');
    },
    destroy({restoreChanges=true}={}){if(restoreChanges)restore();document.removeEventListener('pointermove',move,true);document.removeEventListener('click',click,true);document.removeEventListener('keydown',key,true);host.remove();selected=null;hovered=null;options.onSelectionChange?.(null);}
  };
  return handle;
}

export { evaluateContrast, contrastRatio, parseColor, relativeLuminance, toHexColor };
export type * from './types.js';
