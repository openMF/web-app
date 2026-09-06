# AWS Amplify Deployment

This guide documents the default AWS Amplify Hosting setup for the Mifos X Web App. AWS-specific files are kept at the repository root because Amplify reads them from there. Provider guides for Firebase Hosting or Azure Static Web Apps can be added beside this file later without changing this setup.

## Prerequisites

- Node.js `>= 20.19.0`.
- npm `>= 8.11.0`.
- An AWS Amplify Hosting app connected to this repository and branch.
- A reachable Apache Fineract backend for the deployed web app.
- Amplify environment variables configured for the target backend and tenant.

## Amplify Setup

Use the checked-in root `amplify.yml` as the build specification.

The deployment uses:

- Node version: `20.19.0`, selected through `nvm`
- Install command: `npm ci --cache .npm --prefer-offline`
- Build command: `npm run build`
- Runtime environment command: `node scripts/render-amplify-env.js`
- Artifact directory: `dist/web-app/browser`
- Build cache: `.npm/**/*`

The build does not set a custom `NODE_OPTIONS` memory limit by default. Add one in Amplify only if build logs show an out-of-memory failure and the selected build instance has enough memory.

## Runtime env.js Generation

The Angular build copies `src/assets/env.template.js` into the browser artifact. During the Amplify build, `scripts/render-amplify-env.js` renders:

```bash
dist/web-app/browser/assets/env.js
```

from:

```bash
src/assets/env.template.js
```

This keeps deployment configuration outside the compiled Angular bundle while still producing a static site artifact. The renderer is intentionally implemented with Node instead of `envsubst` so the build does not depend on extra operating system packages in the Amplify image.

The renderer fails the build unless `FINERACT_API_URL` or `FINERACT_API_URLS` is configured. It also escapes rendered values as JavaScript string literals so special characters in environment values cannot break `assets/env.js`.

## Environment Variables

Configure only the variables needed for the target deployment. These names come from `src/assets/env.template.js`.

Backend and tenant:

```text
FINERACT_API_URLS
FINERACT_API_URL
FINERACT_API_PROVIDER
FINERACT_API_VERSION
FINERACT_API_ACTUATOR
FINERACT_PLATFORM_TENANT_IDENTIFIER
FINERACT_PLATFORM_TENANTS_IDENTIFIER
```

Branding and language:

```text
TENANT_LOGO_URL
TENANT_LOGO_URL_DARK
MIFOS_DEFAULT_LANGUAGE
MIFOS_SUPPORTED_LANGUAGES
MIFOS_DEFAULT_FORMAT_DATE
MIFOS_DEFAULT_FORMAT_DATETIME
MIFOS_PRELOAD_CLIENTS
MIFOS_DEFAULT_CHAR_DELIMITER
```

UI and runtime behavior:

```text
MIFOS_ALLOW_SERVER_SWITCH_SELECTOR
MIFOS_DISPLAY_BACKEND_INFO
MIFOS_PRODUCTION_MODE
MIFOS_ENABLE_GLOBAL_DASHBOARD
MIFOS_DISPLAY_TENANT_SELECTOR
MIFOS_DOCUMENTATION_BASE_URL
MIFOS_WAIT_TIME_FOR_NOTIFICATIONS
MIFOS_WAIT_TIME_FOR_CATCHUP
MIFOS_SESSION_IDLE_TIMEOUT
MIFOS_MIN_PASSWORD_LENGTH
MIFOS_HTTP_CACHE_ENABLED
MIFOS_COMPLIANCE_HIDE_CLIENT_DATA
MIFOS_PRODUCTION_MODE_ENABLE_RBAC
MIFOS_ENABLE_CLIENT_ADDRESS_LOCATION
```

OAuth and OIDC:

```text
MIFOS_OAUTH_SERVER_ENABLED
MIFOS_OAUTH_SERVER_URL
MIFOS_OAUTH_SERVER_LOGOUT_URL
MIFOS_OAUTH_CLIENT_ID
MIFOS_OAUTH_AUTHORIZE_URL
MIFOS_OAUTH_TOKEN_URL
MIFOS_OAUTH_REDIRECT_URI
MIFOS_OAUTH_SCOPE
FINERACT_PLUGIN_OIDC_ENABLED
FINERACT_PLUGIN_OIDC_BASE_URL
FINERACT_PLUGIN_OIDC_CLIENT_ID
FINERACT_PLUGIN_OIDC_API_URL
FINERACT_PLUGIN_OIDC_FRONTEND_URL
```

Optional integrations:

```text
MIFOS_INTERBANK_TRANSFERS_API_URL
MIFOS_INTERBANK_TRANSFERS_API_PROVIDER
MIFOS_INTERBANK_TRANSFERS_API_VERSION
MIFOS_INTERBANK_TRANSFERS_ENABLED
CB_ILD_ENABLED
PLUGIN_BASE_URL
MIFOS_REMITTANCE_API_CLIENT_URL
MIFOS_REMITTANCE_API_PROVIDER
MIFOS_REMITTANCE_API_VERSION
MIFOS_REMITTANCE_ENABLED
MIFOS_REMITTANCE_API_CLIENT_HEADER
MIFOS_ENABLE_COPILOT
MIFOS_COPILOT_MCP_BASE_URL
ENABLE_EXTERNAL_NATIONAL_ID_SYSTEM
EXTERNAL_NATIONAL_ID_SYSTEM_URL
EXTERNAL_NATIONAL_ID_SYSTEM_API_HEADER
EXTERNAL_NATIONAL_ID_REGEX
```

Avoid placing secrets in browser-exposed variables. Values rendered into `assets/env.js` are downloadable by users. `MIFOS_REMITTANCE_API_CLIENT_KEY` and `EXTERNAL_NATIONAL_ID_SYSTEM_API_KEY` are intentionally not rendered into Amplify browser assets; keep those values in a server-side proxy or API gateway.

## Fineract Backend and CORS

Amplify hosts the Angular app as a static site. It does not provide the nginx reverse proxy used by the Docker image. The Fineract backend must therefore either:

- allow CORS requests from the Amplify domain, or
- be placed behind a separate proxy/API gateway that handles CORS and forwards to Fineract.

Set `FINERACT_API_URL`, `FINERACT_API_URLS`, `FINERACT_API_PROVIDER`, and `FINERACT_API_VERSION` so the browser can reach the backend directly.

## SPA Rewrite

Angular routes must rewrite to `/index.html`.

Configure this in Amplify Hosting redirects and rewrites:

```text
Source address:
</^[^.]+$|\.(?!(css|gif|ico|jpg|jpeg|js|json|map|png|svg|txt|webp|woff|woff2|ttf|eot)$)([^.]+$)/>

Target address:
/index.html

Type:
200 (Rewrite)
```

The root `rewrites.json` file is a reference and import helper for this rule. Amplify Hosting rewrites are configured through Amplify Hosting settings, not automatically loaded from `rewrites.json`.

## Custom Headers

The root `customHttp.yml` configures default security headers and no-store caching for `index.html` and `assets/env.js`.

The build uses `--output-hashing=none`, so compiled asset filenames can stay the same across deployments. Do not add long-lived immutable caching for JavaScript, CSS, or other static assets unless the build is changed to produce content-hashed filenames.

`assets/env.js` is explicitly uncacheable because it contains deployment-specific runtime configuration and may change independently from compiled assets. `index.html` is also explicitly uncacheable so browsers can discover each newly deployed build.

## Troubleshooting

- Blank page after deploy: confirm the artifact directory is `dist/web-app/browser` and that `index.html` exists there.
- Deep links return 404: confirm the SPA rewrite is configured in Amplify Hosting settings.
- App points at the wrong backend: download or inspect `assets/env.js` from the deployed site and confirm the Amplify environment variables were substituted.
- Backend calls fail in the browser: check Fineract CORS settings or use a separate backend proxy/API gateway.
- Static changes appear but environment changes do not: confirm `assets/env.js` receives `Cache-Control: no-cache, no-store, must-revalidate`.
- Build runs out of memory: increase the Amplify build instance size and then set `NODE_OPTIONS=--max-old-space-size=<size>` only as needed.
