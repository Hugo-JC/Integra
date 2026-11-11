export interface IntegraLiveInspectorPluginOptions {
  entry?: string;
  enabled?: boolean;
}

interface HtmlPlugin {
  name: string;
  apply: 'serve';
  transformIndexHtml: { order: 'post'; handler(html: string): string };
}

/**
 * Injects a lazy, development-only bootstrap. The bootstrap remains registered
 * after activation so the inspector can be recreated after Escape disposes it.
 */
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
const entry = ${JSON.stringify(entry)};
let loading = false;

const shortcut = (event) => {
  if (!event.altKey || !event.shiftKey || event.key.toLowerCase() !== 'i') return;

  const current = window.__INTEGRA_LIVE_INSPECTOR__;
  if (current && !current.isDisposed?.()) return;
  if (loading) return;

  loading = true;
  import(entry).then(({ createIntegraInspector }) => {
    const active = window.__INTEGRA_LIVE_INSPECTOR__;
    if (active && !active.isDisposed?.()) return;
    window.__INTEGRA_LIVE_INSPECTOR__ = createIntegraInspector();
  }).catch((error) => {
    console.error('[Integra Live] Failed to load inspector:', error);
  }).finally(() => {
    loading = false;
  });
};

window.addEventListener('keydown', shortcut, true);
</script>`;

        return html.includes('</body>')
          ? html.replace('</body>', bootstrap + '\n</body>')
          : html + '\n' + bootstrap;
      },
    },
  };
}
