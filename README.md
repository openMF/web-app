# Mifos X Web App ![build](https://github.com/openMF/web-app/actions/workflows/build.yml/badge.svg)

## Overview

Mifos X Web App is a modern single-page application (SPA) built on top of the Mifos X platform for financial inclusion. It serves as the default web interface for the Mifos user community.

**Technologies Used:**

- HTML5, SCSS, and TypeScript
- Angular framework
- Angular Material components

## Quick Links

- [Live Demo](https://sandbox.mifos.community/#/login) (Updated nightly)
- [GitHub Repository](https://github.com/openMF/web-app)
- [TestRigor](https://app.testrigor.com/public/X3THbQd9nxLMxkdPu)
- [Slack Channel](https://app.slack.com/client/T0F5GHE8Y/CJJGJLN10)
- [Jira Board of Mifos](https://mifosforge.jira.com/jira/your-work)
- [Jira Board of Mifos Web App Project](https://mifosforge.jira.com/jira/software/c/projects/WEB/boards/62)

## Installation Guide

### Prerequisites for All Methods

- Git: [Download here](https://git-scm.com/downloads)
- Mifos X Backend (Fineract) - **Required before running the web app**

### Backend Setup (REQUIRED FIRST)

Before installing the web app, you need to set up the Fineract backend server:

1. **Choose ONE of these backend options:**

   - **Option A: Use existing remote server**

     - Use the sandbox at `https://sandbox.mifos.community`
     - Use the demo at `https://demo.mifos.community`
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

This sets up both the Mifos X Web App and Fineract backend:

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

## Configuration Options

### Environment Variables for Docker

All these environment variables can be set when using Docker or Docker Compose:

#### Fineract Backend Settings

| Variable                             | Description                                                          | Default Value                                                                       |
| ------------------------------------ | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| FINERACT_API_URLS                    | Fineract server list                                                 | https://sandbox.mifos.community,https://demo.mifos.community,https://localhost:8443 |
| FINERACT_API_URL                     | Default Fineract server                                              | https://localhost:8443                                                              |
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
| Lithuanian | li   | li-LI.json |
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

| Variable                      | Description                           | Default Value |
| ----------------------------- | ------------------------------------- | ------------- |
| MIFOS_DISPLAY_TENANT_SELECTOR | Display tenant selector in Login view | true          |
| MIFOS_DISPLAY_BACKEND_INFO    | Display backend info in footer        | true          |

For more detailed configuration options, refer to the `env.sample` file in the root directory of the project.

## Releases

### 1.0.0 (Tag: 1.0.0-fineract1.11)

This is the first official release of the Mifos X web application:

- Developed for Fineract 1.11
- No Self Service area
- GLIM support limited
- JLG not yet supported
- Surveys not yet supported

## Contributing

We welcome contributions! Please read our [contribution guidelines](./CONTRIBUTING.md) before submitting pull requests.

## Related Projects

[Apache Fineract](https://github.com/apache/fineract) - Apache Fineract provides open APIs and affordable core banking solution for financial institutions and is the backend for all UIs of the Mifos.
