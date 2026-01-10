'use strict';

/**
 * Proxy configuration for running the app against a local Fineract instance.
 * Usage:
 *   ng serve --proxy-config proxy.localhost.conf.js
 */

module.exports = [
  {
    context: ['/fineract-provider'],
    target: 'http://localhost:8443',
    pathRewrite: { '^/fineract-provider': '' },
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    onProxyReq: function (proxyReq, req, res) {
      const rewrittenPath = (req.url || '').replace(/^\/fineract-provider/, '');
      console.log('[Proxy] Proxying:', req.method, req.url, '->', this.target + rewrittenPath);
    },
    onError: function (err, req, res) {
      console.error(
        '[Proxy] Error while proxying request:',
        req && req.method,
        req && req.url,
        '->',
        this.target,
        '-',
        err && err.message
      );
      if (res && !res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Proxy error: ' + (err && err.message ? err.message : 'Unknown error'));
      }
    }
  }
];
