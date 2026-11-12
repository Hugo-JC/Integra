import { describe, expect, it } from 'vitest';
import { integraLiveInspectorPlugin } from '../../src/modules/live-inspector/vite-plugin.js';

describe('Integra Vite Live Inspector plugin', () => {
  it('is development-only and injects one bootstrap', () => {
    const plugin = integraLiveInspectorPlugin();
    expect(plugin.apply).toBe('serve');
    const html = plugin.transformIndexHtml.handler('<html><body>app</body></html>');
    expect(html).toContain('data-integra-live-bootstrap');
    expect(html).toContain('createIntegraInspector');
    expect(html).toContain('window.addEventListener(\'keydown\', shortcut, true)');
    expect(html).toContain('import(entry)');
    expect(html).toContain('!event.altKey || !event.shiftKey');
    expect(html).toContain('isDisposed?.()');
    expect(html).toContain('loading = false');
    expect(html).not.toContain('removeEventListener');
    expect(html).toContain('</script>\n</body></html>');
    expect(plugin.transformIndexHtml.handler(html)).toBe(html);
  });

  it('keeps the lazy bootstrap available to recreate the controller after Escape', () => {
    const html = integraLiveInspectorPlugin().transformIndexHtml.handler('<body></body>');
    expect(html).toContain('const current = window.__INTEGRA_LIVE_INSPECTOR__');
    expect(html).toContain('if (current && !current.isDisposed?.()) return;');
    expect(html).toContain('window.__INTEGRA_LIVE_INSPECTOR__ = createIntegraInspector()');
    expect(html).toContain('window.addEventListener(\'keydown\', shortcut, true)');
  });

  it('does not eagerly load the inspector module before the shortcut', () => {
    const html = integraLiveInspectorPlugin().transformIndexHtml.handler('<body></body>');
    expect(html).toContain('import(entry)');
    expect(html).not.toContain('import { createIntegraInspector }');
  });

  it('can be disabled', () => {
    const plugin = integraLiveInspectorPlugin({ enabled: false });
    expect(plugin.transformIndexHtml.handler('<body></body>')).toBe('<body></body>');
  });

  it('supports an explicit entry path', () => {
    const html = integraLiveInspectorPlugin({ entry: '/custom/live-entry.ts' })
      .transformIndexHtml.handler('<body></body>');
    expect(html).toContain('const entry = "/custom/live-entry.ts"');
  });
});
