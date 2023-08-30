# Mifos X Web App [![Build Status](https://travis-ci.com/openMF/web-app.svg?branch=master)](https://travis-ci.com/openMF/web-app) [![Gitter](https://badges.gitter.im/openMF/web-app.svg)](https://gitter.im/openMF/web-app?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Mifos X Web App is the revamped version of the Mifos X Community App, an effective financial inclusion solution and the default web application built on top of the Mifos X platform for the Mifos User Community.

It is a Single-Page App (SPA) written in standard web technologies [HTML5](http://whatwg.org/html), [SCSS](http://sass-lang.com) and [TypeScript](http://www.typescriptlang.org). It leverages the popular [Angular](https://angular.io/) framework and [Angular Material](https://material.angular.io/) for material design components.


## Getting started using

The latest code is continuously deployed at https://openmf.github.io/web-app/ whenever a PR is merged into the master branch.


## Getting started developing

1. Ensure you have the following installed in your system:

    [`git`](https://git-scm.com/downloads)

    [`npm`](https://nodejs.org/en/download/)

2. Install [angular-cli](https://github.com/angular/angular-cli) globally.
```
npm install -g @angular/cli@14.2.12
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

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

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

As Prerequisites, you must have `docker` and `docker-compose` installed on your machine; see
[Docker Install](https://docs.docker.com/install/) and
[Docker Compose Install](https://docs.docker.com/compose/install/).

Now to run a new MifosX Web App instance you can simply:

1. `git clone https://github.com/openMF/web-app.git ; cd web-app`
1. for windows, use `git clone https://github.com/openMF/web-app.git --config core.autocrlf=input ; cd web-app`
1. `docker-compose up -d`
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
MIFOS_SUPPORTED_LANGUAGES=en-US,fr-FR
```


Setting for applying the Client preload in the Clients view, Default true
```
MIFOS_PRELOAD_CLIENTS=false
```


Setting for exporting report table to CSV file using this field delimiter
```
MIFOS_DEFAULT_CHAR_DELIMITER=,
```

For more information look the env.sample file in the root directory of the project

## Want to help? [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/openMF/web-app/issues)

Want to file a bug, request a feature, contribute some code, or improve documentation? Excellent! Read up on our guidelines for [contributing](.github/CONTRIBUTING.md) and then check out one of our [issues](https://github.com/openMF/web-app/issues). Make sure you follow the guidelines before sending a contribution!
