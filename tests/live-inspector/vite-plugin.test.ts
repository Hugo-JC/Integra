import { describe, expect, it } from 'vitest';
import { integraLiveInspectorPlugin } from '../../src/modules/live-inspector/vite-plugin.js';

describe('Integra Vite Live Inspector plugin', () => {
  it('is development-only and injects one bootstrap', () => {
    const plugin=integraLiveInspectorPlugin();
    expect(plugin.apply).toBe('serve');
    const html=plugin.transformIndexHtml.handler('<html><body>app</body></html>');
    expect(html).toContain('data-integra-live-bootstrap');
    expect(html).toContain('createIntegraInspector');
    expect(html).toContain('window.addEventListener(\'keydown\', shortcut, true)');
    expect(html).toContain('import(');
    expect(html).toContain('event.altKey && !');
    expect(plugin.transformIndexHtml.handler(html)).toBe(html);
  });
  it('does not eagerly load the inspector module before the shortcut', () => {
    const plugin=integraLiveInspectorPlugin();
    const html=plugin.transformIndexHtml.handler('<body></body>');
    expect(html).toContain('window.removeEventListener');
    expect(html).toContain('import(\'/src/modules/live-inspector/index.ts\')');
    expect(html).not.toContain('import { createIntegraInspector }');
  });
  it('can be disabled', () => {
    const plugin=integraLiveInspectorPlugin({enabled:false});
    expect(plugin.transformIndexHtml.handler('<body></body>')).toBe('<body></body>');
  });
});
