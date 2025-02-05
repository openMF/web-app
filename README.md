# Mifos X Web App ![build](https://github.com/openMF/web-app/actions/workflows/build.yml/badge.svg) [Slack](https://app.slack.com/client/T0F5GHE8Y/CJJGJLN10)

Mifos X Web App is the revamped version of the Mifos X Community App, an effective financial inclusion solution and the default web application built on top of the Mifos X platform for the Mifos User Community.

It is a Single-Page App (SPA) written in standard web technologies [HTML5](http://whatwg.org/html), [SCSS](http://sass-lang.com) and [TypeScript](http://www.typescriptlang.org). It leverages the popular [Angular](https://angular.io/) framework and [Angular Material](https://material.angular.io/) for material design components.

## Getting started using

The latest code is continuously deployed at [https://sandbox.mifos.community/#/login](https://sandbox.mifos.community/#/login) every night.

## Getting started developing

1. Ensure you have the following installed in your system:

   [`git`](https://git-scm.com/downloads)

   [`nodeJs`](https://nodejs.org/en/download/)

2. Install [angular-cli](https://github.com/angular/angular-cli) globally.

```
npm install -g @angular/cli@16.0.2
```

3. Clone the project locally into your system.

```
git clone https://github.com/openMF/web-app.git
```

4. `cd` into project root directory and make sure you are on the master branch.

5. Install the dependencies.

```
npm install
```

6. To preview the app, run the following command and navigate to `http://localhost:4200/`.

```
ng serve
```

The application is using the development server with basic authentication by default. The credentials for the same are:

    Username - mifos
    Password - password

**Important Note:** Please do not make any alterations to these credentials.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use
`ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--configuration production` flag for a production build.

Run `npm run build:prod` to build a production artifacts Instead.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the
[Angular-CLI README](https://github.com/angular/angular-cli).

## Setting up a local server

Follow the given instructions for your operating system to setup a local server for the Mifos X platform.

[Windows](https://cwiki.apache.org/confluence/display/FINERACT/Fineract-platform+Installation+on+Windows)

[Ubuntu](https://cwiki.apache.org/confluence/display/FINERACT/Fineract+Installation+on+Ubuntu+Server)

For connecting to server running elsewhere update the base API URL and/or tenant identifier property in the `environments/environment.ts` file and `environments/environment.prod.ts` file for development and production use respectively.

By default OAuth2 is disabled. To enable it, change the value of oauth.enabled property to true in the `environments/environment.ts` file and `environments/environment.prod.ts` file for development and production use respectively.

### Docker

To locally build this Docker image from source (after `git clone` this repo), run:

```
docker build -t openmf/web-app:latest .
```

You can then run a Docker Container from the image above like this:

```
docker run -d -p 4200:80 openmf/web-app:latest
```

Access the webapp on http://localhost:4200 in your browser.

### Docker compose

It is possible to do a 'one-touch' installation of Mifos X Web App using containers (AKA "Docker").
Fineract now packs the Mifos community-app web UI in it's docker deploy.

As Prerequisites, you must have `docker` and Docker Compose v2 or later installed on your machine; see
[Docker Install](https://docs.docker.com/install/) and
[Docker Compose Install](https://docs.docker.com/compose/install/).

Now to run a new MifosX Web App instance you can simply:

1. `git clone https://github.com/openMF/web-app.git ; cd web-app`
1. for windows, use `git clone https://github.com/openMF/web-app.git --config core.autocrlf=input ; cd web-app`
1. `docker compose up -d`
1. Access the webapp on http://localhost:4200 in your browser.

You can also setup different configurations for the MifosX Web App using environment variables:

1. Use environment variables (best choice if you run with Docker Compose):

Fineract backend settings

```
FINERACT_API_URLS
```

Value to set a Fineract server list (environments) to be used, Default value:

```
https://dev.mifos.io,https://demo.mifos.io,https://qa.mifos.io,https://staging.mifos.io,https://mobile.mifos.io,https://demo.fineract.dev,https://localhost:8443
```

```
FINERACT_API_URL
```

Default value used from the Fineract server list. Default value:

```
https://localhost:8443
```

```
FINERACT_PLATFORM_TENANT_IDENTIFIER
```

Fineract Tenant identifier to be used by default, It must be aligned with the Fineract `tenants` table. Default value:

```
default
```

```
FINERACT_PLATFORM_TENANTS_IDENTIFIER
```

Fineract Tenant identifier list to be used, Those must be aligned with the Fineract `tenants` table.

Setting for Languages (i18n) still under development

```
MIFOS_DEFAULT_LANGUAGE=en-US
```

```
MIFOS_SUPPORTED_LANGUAGES=cs-CS,de-DE,en-US,es-MX,fr-FR,it-IT,ko-KO,lt-LT,lv-LV,ne-NE,pt-PT,sw-SW
```

These are the Language available now:

```
MIFOS_SESSION_IDLE_TIMEOUT=300000
```

Time in milliseconds for Session idle timeout, default 300000 seconds

|  Language  | Code |    File    |
| :--------: | :--: | :--------: |
|   Czech    |  cs  | cs-CS.json |
|   German   |  de  | de-DE.json |
|  English   |  en  | en-US.json |
|  Spanish   |  es  | es-MX.json |
|   French   |  fr  | fr-FR.json |
|  Italian   |  it  | it-IT.json |
|   Korean   |  ko  | ko-KO.json |
| Lithuanian |  li  | li-LI.json |
|  Latvian   |  lv  | lv-LV.json |
|   Nepali   |  ne  | ne-NE.json |
| Portuguese |  pt  | pt-PT.json |
|  Swahili   |  sw  | sw-SW.json |

Setting for applying the Client preload in the Clients view, Default true

```
MIFOS_PRELOAD_CLIENTS=false
```

Setting for exporting report table to CSV file using this field delimiter

```
MIFOS_DEFAULT_CHAR_DELIMITER=,
```

Setting for Wait time in seconds for reading the user notifications, Default 60 seconds

```
MIFOS_WAIT_TIME_FOR_NOTIFICATIONS=60
```

Setting for Wait time in seconds for reading the COB Catch-Up status, Default 30 seconds

```
MIFOS_WAIT_TIME_FOR_CATCHUP=30
```

Setting for display or hide the Tenant selector in the Login view (mainly for Production environments and for security reasons), Default true

```
MIFOS_DISPLAY_TENANT_SELECTOR=false
```

Setting for display or hide the Backend info (url) in the footer part (mainly for security reasons), Default true

```
MIFOS_DISPLAY_BACKEND_INFO=false
```

For more information look the env.sample file in the root directory of the project

# Jira Links

Jira Board Link: [Kanban Board]
https://mifosforge.jira.com/jira/your-work

Jira Web App Project Link:  
https://mifosforge.jira.com/jira/software/c/projects/WEB/boards/62

## Want to help? [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/openMF/web-app/issues)

Want to file a bug, request a feature, contribute some code, or improve documentation? Excellent! Read up on our guidelines for [contributing](.github/CONTRIBUTING.md) and then check out one of our [issues](https://github.com/openMF/web-app/issues). Make sure you follow the guidelines before sending a contribution!

Apache Fineract provides open APIs and affordable core banking solution for financial institutions
and it is the backend for all UIs of the Mifos. Its GitHub Repository is (https://github.com/apache/fineract)
