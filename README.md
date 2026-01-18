# Mifos® X Web App ![build](https://github.com/openMF/web-app/actions/workflows/build.yml/badge.svg)

## Overview

Mifos® X Web App is a modern single-page application (SPA) built on top of the Mifos® X platform for financial inclusion. It serves as the default web interface for the Mifos® user community.

**Technologies Used:**

- HTML5, SCSS, and TypeScript
- Angular framework
- Angular Material components

## Quick Links

- [Live Demo](https://sandbox.mifos.community/#/login) (Updated nightly — sandbox data is reset every 6 hours; test data and transient state may be cleared.)
- [GitHub Repository](https://github.com/openMF/web-app)
- [Slack Channel](https://app.slack.com/client/T0F5GHE8Y/CJJGJLN10)
- [Jira Board of Mifos](https://mifosforge.jira.com/jira/your-work)
- [Jira Board of Mifos Web App Project](https://mifosforge.jira.com/jira/software/c/projects/WEB/boards/62)

## Installation Guide

### Prerequisites for All Methods

- Git: [Download here](https://git-scm.com/downloads)
- Mifos® X Backend (Apache Fineract®) - **Required before running the web app**

### Backend Setup (REQUIRED FIRST)

Before installing the web app, you need to set up the Apache Fineract® backend server:

1. **Choose ONE of these backend options:**
   - **Option A: Use existing remote server**
   - Use the [sandbox (MariaDB)](https://sandbox.mifos.community) — sandbox data is reset every 6 hours; test data and transient state may be cleared.
   - Use the [demo (MariaDB)](https://demo.mifos.community)
   - Use the [demo (Keycloak)](https://oauth.mifos.community)
   - Use the [demo (2FA)](https://2fa.mifos.community)
   - Use the [demo (Oidc)](https://oidc.mifos.community)
   - Use the [demo (Postgres)](https://elephant.mifos.community)
   - Configure to your server by updating API URLs in environment files

   - **Option B: Install local Fineract server**

     [Installation Guide](https://github.com/apache/fineract?tab=readme-ov-file#instructions-how-to-run-for-local-development)

   - **Option C: Docker Compose for full stack**
     - See Docker Compose section below for one-step backend+frontend setup

2. **Configure environment files to point to your backend:**
   - Update `environments/environment.ts` (development)
   - Update `environments/environment.prod.ts` (production)
   - Change OAuth2 settings if needed (disabled by default)

### Frontend Setup (Web App)

Choose ONE of the following methods to install the web app:

#### Method 1: Manual Installation

1. Install Node.js: [Download here](https://nodejs.org/en/download/)
2. Install Angular CLI:
   ```
   npm install -g @angular/cli@16.0.2
   ```
3. Clone the repository:
   ```
   git clone https://github.com/openMF/web-app.git
   ```
   For Windows:
   ```
   git clone https://github.com/openMF/web-app.git --config core.autocrlf=input
   ```
4. Navigate to the project directory:
   ```
   cd web-app
   ```
5. Install dependencies:
   ```
   npm install
   ```
6. Start the development server:
   ```
   ng serve
   ```
7. Access the application at `http://localhost:4200/`

#### Method 2: Docker Container Only

1. Build the Docker image:
   ```
   docker build -t openmf/web-app:latest .
   ```
2. Run the container:
   ```
   docker run -d -p 4200:80 openmf/web-app:latest
   ```
3. Access the application at `http://localhost:4200/`

#### Method 3: Docker Compose (Frontend + Backend)

This sets up both the Mifos® X Web App and Apache Fineract® backend:

1. Clone the repository:
   ```
   git clone https://github.com/openMF/web-app.git
   cd web-app
   ```
   For Windows:
   ```
   git clone https://github.com/openMF/web-app.git --config core.autocrlf=input
   cd web-app
   ```
2. Start Docker Compose:
   ```
   docker compose up -d
   ```
3. Access the application at `http://localhost:4200/`

## Default Login Credentials

When using the development server with basic authentication:

- **Username:** mifos
- **Password:** password

**Important:** Do not alter these credentials.

## Development Commands

- **Serve application:** `ng serve`
- **Generate new component:** `ng generate component component-name`
- **Build for production:** `ng build --configuration production` or `npm run build:prod`
- **Get Angular CLI help:** `ng help`

## Proxy Configuration

The web app includes a proxy configuration (`proxy.conf.js`) that allows you to forward API requests to a remote Fineract backend during local development. This helps avoid CORS issues and enables you to work against production-like environments.

### Using the Sandbox Proxy (Default)

By default, the proxy forwards `/fineract-provider` requests to the Mifos sandbox environment:

- **Target:** `https://sandbox.mifos.community`
- **API Endpoint:** `https://apis.mifos.community` (exposed in the sandbox)
- **System Reset:** Sandbox test data and transient state are reset every 6 hours (expect data to be periodically cleared).

**Sandbox Environment Variables:**

```bash
FINERACT_API_URLS=https://apis.mifos.community
FINERACT_API_URL=https://apis.mifos.community
FINERACT_API_PROVIDER=/fineract-provider/api
FINERACT_API_ACTUATOR=/fineract-provider
FINERACT_API_VERSION=/v1
FINERACT_PLATFORM_TENANT_IDENTIFIER=default
MIFOS_DEFAULT_LANGUAGE=en-US
MIFOS_SUPPORTED_LANGUAGES=cs-CS,de-DE,en-US,es-MX,fr-FR,it-IT,ko-KO,lt-LT,lv-LV,ne-NE,pt-PT,sw-SW
MIFOS_PRELOAD_CLIENTS=true
MIFOS_DEFAULT_CHAR_DELIMITER=,
```

### Using a Local Fineract Instance

To proxy to a local Fineract server instead:

Use the provided localhost proxy file (recommended for `ng serve`):

1. Start the dev server with the localhost proxy:

   ```bash
   ng serve --proxy-config proxy.localhost.conf.js
   ```

2. Ensure your local Fineract instance is running on `http://localhost:8443`.

Notes:

- `proxy.localhost.conf.js` forwards `/fineract-provider` to your local backend to avoid CORS during development.
- The `HttpsProxyAgent` / `setupForProxy` logic (present in `proxy.conf.js`) is only necessary when an upstream corporate/HTTP proxy must be used (set via `HTTP_PROXY`/`http_proxy`). It is not required for a direct `localhost` backend.

### Proxy Features

- **CORS Avoidance:** Eliminates cross-origin issues during local development
- **Error Handling:** Gracefully handles proxy failures with detailed logging
- **Corporate Proxy Support:** Maintains support for corporate proxy agents via `HTTP_PROXY` environment variable
- **Debug Logging:** All proxy requests are logged for troubleshooting

The proxy is configured to work with Fineract endpoints as described in this section.

### Testing the Proxy

To verify the proxy is working correctly, start the development server (`ng serve`) and test with curl:

**Successful proxy request:**

```bash
curl -i "http://localhost:4200/fineract-provider/api/v1/runreports/FullClientReport?R_officeId=1&output-type=HTML&R_loanOfficerId=-1"
```

Expected: HTTP 200 response with proxied data from the sandbox. Server console shows:

```text
[Proxy] Proxying: GET /fineract-provider/api/v1/runreports/... -> https://sandbox.mifos.community/api/v1/runreports/...
```

**Simulated proxy error (backend unreachable):**

If the backend is unreachable or returns an error, the proxy returns HTTP 502:

```bash
# Stop your Fineract backend (if using localhost) or test with an invalid target
# The proxy will log the error and return:
```

Server console (example):

```text
[Proxy] Error while proxying request: GET /fineract-provider/... -> https://sandbox.mifos.community - ECONNREFUSED
```

HTTP response:

```http
HTTP/1.1 502 Bad Gateway
Content-Type: text/plain

Proxy error: connect ECONNREFUSED
```

## Configuration Options

### Environment Variables for Docker

All these environment variables can be set when using Docker or Docker Compose:

#### Fineract Backend Settings

| Variable                             | Description                                                          | Default Value                                                                       |
| ------------------------------------ | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| FINERACT_API_URLS                    | Fineract server list                                                 | https://sandbox.mifos.community,https://demo.mifos.community,https://localhost:8443 |
| FINERACT_API_URL                     | Default Fineract server                                              | https://localhost:8443                                                              |
| FINERACT_API_ACTUATOR                | Default Fineract Actuator endpoint                                   | /fineract-provider                                                                  |
| FINERACT_PLATFORM_TENANT_IDENTIFIER  | Default tenant identifier (must align with Fineract `tenants` table) | default                                                                             |
| FINERACT_PLATFORM_TENANTS_IDENTIFIER | Tenant identifier list (must align with Fineract `tenants` table)    | -                                                                                   |

#### Language Settings (i18n)

| Variable                  | Description                 | Default Value                                                           |
| ------------------------- | --------------------------- | ----------------------------------------------------------------------- |
| MIFOS_DEFAULT_LANGUAGE    | Default language            | en-US                                                                   |
| MIFOS_SUPPORTED_LANGUAGES | List of supported languages | cs-CS,de-DE,en-US,es-MX,fr-FR,it-IT,ko-KO,lt-LT,lv-LV,ne-NE,pt-PT,sw-SW |

Available languages:

| Language   | Code | File       |
| ---------- | ---- | ---------- |
| Czech      | cs   | cs-CS.json |
| German     | de   | de-DE.json |
| English    | en   | en-US.json |
| Spanish    | es   | es-MX.json |
| French     | fr   | fr-FR.json |
| Italian    | it   | it-IT.json |
| Korean     | ko   | ko-KO.json |
| Lithuanian | lt   | lt-LT.json |
| Latvian    | lv   | lv-LV.json |
| Nepali     | ne   | ne-NE.json |
| Portuguese | pt   | pt-PT.json |
| Swahili    | sw   | sw-SW.json |

#### Session & Performance Settings

| Variable                          | Description                                          | Default Value |
| --------------------------------- | ---------------------------------------------------- | ------------- |
| MIFOS_SESSION_IDLE_TIMEOUT        | Session timeout in milliseconds                      | 300000        |
| MIFOS_PRELOAD_CLIENTS             | Whether to preload clients in Clients view           | true          |
| MIFOS_DEFAULT_CHAR_DELIMITER      | Character delimiter for CSV exports                  | ,             |
| MIFOS_WAIT_TIME_FOR_NOTIFICATIONS | Wait time in seconds for reading notifications       | 60            |
| MIFOS_WAIT_TIME_FOR_CATCHUP       | Wait time in seconds for reading COB Catch-Up status | 30            |
| MIFOS_MIN_PASSWORD_LENGTH         | Minimum length for user passwords                    | 12            |
| MIFOS_HTTP_CACHE_ENABLED          | whether to use HTTP Get calls with cache             | false         |

#### UI Display Settings

| Variable                           | Description                            | Default Value |
| ---------------------------------- | -------------------------------------- | ------------- |
| MIFOS_DISPLAY_TENANT_SELECTOR      | Display tenant selector in Login view  | true          |
| MIFOS_DISPLAY_BACKEND_INFO         | Display backend info in footer         | true          |
| MIFOS_ALLOW_SERVER_SWITCH_SELECTOR | Display DNS server list                | true          |
| MIFOS_COMPLIANCE_HIDE_CLIENT_DATA  | Hide client names in UI (mask with \*) | false         |

#### OAUTH Settings

| Variable                   | Description                    | Default Value |
| -------------------------- | ------------------------------ | ------------- |
| MIFOS_OAUTH_SERVER_ENABLED | Enable the use of Oauth server | false         |
| MIFOS_OAUTH_SERVER_URL     | Set the Oauth server URL       |               |
| MIFOS_OAUTH_CLIENT_ID      | Set the Client Id              |               |

#### OIDC Settings

| Variable                          | Description                    | Default Value |
| --------------------------------- | ------------------------------ | ------------- |
| FINERACT_PLUGIN_OIDC_ENABLED      | Enable the use of Oidc server  | false         |
| FINERACT_PLUGIN_OIDC_BASE_URL     | Set the Oidc server URL        |               |
| FINERACT_PLUGIN_OIDC_CLIENT_ID    | Set the Client Id              |               |
| FINERACT_PLUGIN_OIDC_API_URL      | Set the Client API URL         |               |
| FINERACT_PLUGIN_OIDC_FRONTEND_URL | Set the Front End URL callback |               |

For more detailed configuration options, refer to the `env.sample` file in the root directory of the project.

### Client Data Masking Example

When `MIFOS_COMPLIANCE_HIDE_CLIENT_DATA=false` (default):

EMANUEL CASTILLO
MIGUEL TECO

When `MIFOS_COMPLIANCE_HIDE_CLIENT_DATA=true`:

E**\*** C**\*\*\***
M**\*** T\*\*\*

This applies to client name display, e.g. in Institution/Clients list.

## Releases

### 1.0.0 (Tag: 1.0.0-fineract1.11)

This is the first official release of the Mifos® X web application:

- Developed for Apache Fineract® 1.11
- No Self Service area
- GLIM support limited
- JLG not yet supported
- Surveys not yet supported

## Contributing

We welcome contributions! Please read our [contribution guidelines](./CONTRIBUTING.md) before submitting pull requests.

## Related Projects

[Apache Fineract](https://github.com/apache/fineract) - Apache Fineract® provides open APIs and affordable core banking solution for financial institutions and is the backend for all UIs of the Mifos®.
