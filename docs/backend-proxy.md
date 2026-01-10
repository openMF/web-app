# Backend proxy

Usually when working on a web application you consume data from custom-made APIs.

To ease development with our development server integrating live reload while keeping your backend API calls working,
we also have setup a backend proxy to redirect API calls to whatever URL and port you want. This allows you:

- To develop frontend features without the need to run an API backend locally
- To use a local development server without [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) issues
- To debug frontend code with data from a remote testing platform directly

## How to configure

In the root folder you will find a `proxy.conf.js`, containing the backend proxy configuration.

The interesting part is there:

```js
const proxyConfig = [
  {
    context: ['/fineract-provider'],
    target: 'https://sandbox.mifos.community',
    pathRewrite: { '^/fineract-provider': '' },
    changeOrigin: true,
    secure: true,
    logLevel: 'debug',
    onProxyReq: function (proxyReq, req, res) {
      // Log the rewritten path so the console shows the actual forwarded URL
      const rewrittenPath = (req.url || '').replace(/^\/fineract-provider/, '');
      console.log('[Proxy] Proxying:', req.method, req.url, '->', this.target + rewrittenPath);
    },
    onError: function (err, req, res) {
      // Log proxy errors and return HTTP 502 to the client
      console.error('[Proxy] Error while proxying request:', req.method, req.url, '->', this.target, '-', err.message);
      if (res && !res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Proxy error: ' + err.message);
      }
    }
  }
];
```

This forwards requests sent to `/fineract-provider/...` on the dev server to the Fineract backend root (for example,
`/fineract-provider/1.0/...` becomes `https://sandbox.mifos.community/1.0/...`). Use `pathRewrite` to strip the prefix
because the sandbox exposes Fineract APIs at the root path.

**Error Handling:**

The `onError` handler captures proxy failures (network errors, backend unreachable, timeouts, etc.) and:

- Logs detailed error information to the server console (method, URL, target, error message)
- Returns HTTP 502 (Bad Gateway) to the client with a plain-text error message

Example server console output when proxy fails:

```text
[Proxy] Error while proxying request: GET /fineract-provider/api/v1/clients -> https://sandbox.mifos.community - ECONNREFUSED
```

Example client response:

```http
HTTP/1.1 502 Bad Gateway
Content-Type: text/plain

Proxy error: connect ECONNREFUSED
```

You can add multiple rules or change the `target` to point to other environments (demo, localhost, etc.).

For the complete set of options, see the `http-proxy-middleware`
[documentation](https://github.com/chimurai/http-proxy-middleware#options).

### Corporate proxy support

The repository configures a helper function in `proxy.conf.js` named `setupForProxy` which will attach an
`HttpsProxyAgent` to proxy entries when the `HTTP_PROXY` (or `http_proxy`) environment variable is present. This lets
the dev server forward requests through a corporate proxy when required.

**Behavior:**

- **When `HTTP_PROXY` is set:** Logs `"Using proxy server: <url>"` and configures the agent for corporate proxy forwarding
- **When `HTTP_PROXY` is not set:** Logs `"No proxy server configured. API requests will not be proxied."` — note that this refers only to corporate proxy forwarding; the Angular dev server proxy (forwarding `/fineract-provider` to the sandbox) still works normally

See `proxy.conf.js` for the exact implementation.

If your corporate proxy uses a custom SSL certificate you may need to set `secure: false` on the specific proxy entry
or configure your environment to trust the corporate CA.
