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
import { createIntegraInspector } from ${JSON.stringify(entry)};
if (!window.__INTEGRA_LIVE_INSPECTOR__) window.__INTEGRA_LIVE_INSPECTOR__ = createIntegraInspector();
</script>`;
        return html.includes('</body>') ? html.replace('</body>', bootstrap + '\n</body>') : html + '\n' + bootstrap;
      }
    }
  };
}
