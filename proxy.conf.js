'use strict';

/**
 * Proxy configuration for the Mifos web-app.
 *
 * By default, proxies to the LOCAL Fineract instance on https://localhost:8443.
 * Override with the FINERACT_API_URL environment variable:
 *   FINERACT_API_URL=https://sandbox.mifos.community ng serve --proxy-config proxy.conf.js
 */

const target = process.env.FINERACT_API_URL || 'https://localhost:8443';

console.log(`[Proxy] Fineract backend target: ${target}`);

module.exports = [
  {
    context: ['/fineract-provider'],
    target: target,
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    onProxyReq: function (proxyReq, req, res) {
      console.log('[Proxy]', req.method, req.url, '->', target + req.url);
    },
    onError: function (err, req, res) {
      console.error('[Proxy] Error:', req && req.method, req && req.url, '->', target, '-', err && err.message);
      if (res && !res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Proxy error: ' + (err && err.message ? err.message : 'Unknown error'));
      }
    }
  },
  {
    context: ['/external-nationalid'],
    target: 'https://apis.mifos.community',
    pathRewrite: { '^/external-nationalid': '/1.0/nationalid' },
    changeOrigin: true,
    secure: true,
    logLevel: 'debug',
    headers: {
      ...(process.env.EXTERNAL_NATIONAL_ID_SYSTEM_API_KEY
        ? { 'X-Gravitee-Api-Key': process.env.EXTERNAL_NATIONAL_ID_SYSTEM_API_KEY }
        : {})
    },
    onProxyReq: function (proxyReq, req, res) {
      const rewrittenPath = (req.url || '').replace(/^\/external-nationalid/, '/1.0/nationalid');
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
  },
  {
    context: ['/remittance-api'],
    target: 'https://apis.mifos.community',
    pathRewrite: { '^/remittance-api': '/1.0/remittance' },
    changeOrigin: true,
    secure: true,
    logLevel: 'debug',
    headers: {
      ...(process.env.MIFOS_REMITTANCE_API_KEY
        ? { [process.env.MIFOS_REMITTANCE_API_HEADER || 'X-Gravitee-Api-Key']: process.env.MIFOS_REMITTANCE_API_KEY }
        : {})
    },
    onProxyReq: function (proxyReq, req, res) {
      const rewrittenPath = (req.url || '').replace(/^\/remittance-api/, '/1.0/remittance');
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
