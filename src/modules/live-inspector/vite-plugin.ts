export interface IntegraLiveInspectorPluginOptions {
  entry?: string;
  enabled?: boolean;
}

interface HtmlPlugin {
  name: string;
  apply: 'serve';
  transformIndexHtml: { order: 'post'; handler(html: string): string };
}

/** Injects the inspector into Vite development HTML only; production builds never load it. */
export function integraLiveInspectorPlugin(options: IntegraLiveInspectorPluginOptions = {}): HtmlPlugin {
  const enabled = options.enabled ?? true;
  const entry = options.entry ?? '/src/modules/live-inspector/index.ts';
  return {
    name: 'integra-live-inspector',
    apply: 'serve',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        if (!enabled || html.includes('data-integra-live-bootstrap')) return html;
        const bootstrap = `<script type="module" data-integra-live-bootstrap>
const shortcut = (event) => {
  if (!event.altKey || !event.shiftKey || event.key.toLowerCase() !== 'i') return;
  window.removeEventListener('keydown', shortcut, true);
  import(${JSON.stringify(entry)}).then(({ createIntegraInspector }) => {
    if (!window.__INTEGRA_LIVE_INSPECTOR__) {
      window.__INTEGRA_LIVE_INSPECTOR__ = createIntegraInspector();
    }
  }).catch((error) => console.error('[Integra Live] Failed to load inspector:', error));
};
window.addEventListener('keydown', shortcut, true);
</script>`;
        return html.includes('</body>') ? html.replace('</body>', bootstrap + '\n</body>') : html + '\n' + bootstrap;
      }
    }
  };
}
