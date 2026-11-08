import { describe, expect, it } from 'vitest';
import { integraLiveInspectorPlugin } from '../../src/modules/live-inspector/vite-plugin.js';

describe('Integra Vite Live Inspector plugin', () => {
  it('is development-only and injects one bootstrap', () => {
    const plugin=integraLiveInspectorPlugin();
    expect(plugin.apply).toBe('serve');
    const html=plugin.transformIndexHtml.handler('<html><body>app</body></html>');
    expect(html).toContain('data-integra-live-bootstrap');
    expect(html).toContain('createIntegraInspector');
    expect(plugin.transformIndexHtml.handler(html)).toBe(html);
  });
  it('can be disabled', () => {
    const plugin=integraLiveInspectorPlugin({enabled:false});
    expect(plugin.transformIndexHtml.handler('<body></body>')).toBe('<body></body>');
  });
});
