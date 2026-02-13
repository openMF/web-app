/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const { HttpsProxyAgent } = require('https-proxy-agent');

/* IMPORTANT:
 * API proxy configuration.
 * This allows you to proxy HTTP request like `http.get('/api/stuff')` to another server/port.
 * This is especially useful during app development to avoid CORS issues while running a local server.
 * For more details and options, see https://github.com/angular/angular-cli#proxy-to-backend
 */
const proxyConfig = [
  {
    context: ['/fineract-provider'],
    target: 'https://sandbox.mifos.community',
    pathRewrite: { '^/fineract-provider': '' },
    changeOrigin: true,
    secure: true,
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
  },
  {
    context: ['/external-nationalid'],
    target: 'https://apis.mifos.community',
    pathRewrite: { '^/external-nationalid': '/1.0/nationalid' },
    changeOrigin: true,
    secure: true,
    logLevel: 'debug',
    onProxyReq: function (proxyReq, req, res) {
      // Inject API key server-side (same as nginx proxy_set_header in production)
      const apiKey = process.env.EXTERNAL_NATIONAL_ID_SYSTEM_API_KEY || '';
      if (apiKey) {
        proxyReq.setHeader('X-Gravitee-Api-Key', apiKey);
      }
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
  }
  // For local development use `proxy.localhost.conf js` .
];

/*
 * Configures a proxy agent for the API proxy if needed.
 */
function setupForProxy(proxyConfig) {
  if (!Array.isArray(proxyConfig)) {
    proxyConfig = [proxyConfig];
  }

  const proxyServer = process.env.http_proxy || process.env.HTTP_PROXY;
  let agent = null;

  if (proxyServer) {
    console.log(`Using proxy server: ${proxyServer}`);
    agent = new HttpsProxyAgent(proxyServer);
    proxyConfig.forEach((entry) => {
      entry.agent = agent;
    });
  } else {
    console.warn('No proxy server configured. API requests will not be proxied.');
  }

  return proxyConfig;
}

module.exports = setupForProxy(proxyConfig);
