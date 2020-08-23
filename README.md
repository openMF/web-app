# Mifos X Web App [![Build Status](https://travis-ci.com/openMF/web-app.svg?branch=master)](https://travis-ci.com/openMF/web-app) [![Gitter](https://badges.gitter.im/openMF/web-app.svg)](https://gitter.im/openMF/web-app?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Mifos X Web App is the revamped version of the Mifos X Community App, an effective financial inclusion solution and the default web application built on top of the Mifos X platform for the Mifos User Community.

It is a Single-Page App (SPA) written in standard web technologies [HTML5](http://whatwg.org/html), [SCSS](http://sass-lang.com) and [TypeScript](http://www.typescriptlang.org). It leverages the popular [Angular](https://angular.io/) framework and [Angular Material](https://material.angular.io/) for material design components.


## Getting started

1. Ensure you have the following installed in your system:

    [`git`](https://git-scm.com/downloads)

    [`npm`](https://nodejs.org/en/download/)

2. Install [angular-cli](https://github.com/angular/angular-cli) globally.
```
npm install -g @angular/cli@9.1.12
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

### Further help

To get more help on the Angular CLI use `ng help` or go check out the
[Angular-CLI README](https://github.com/angular/angular-cli).


## Setting up a local server

Follow the given instructions for your operating system to setup a local server for the Mifos X platform.

[Windows](https://cwiki.apache.org/confluence/display/FINERACT/Fineract-platform+Installation+on+Windows)

[Ubuntu](https://cwiki.apache.org/confluence/display/FINERACT/Fineract+Installation+on+Ubuntu+Server)

For connecting to server running elsewhere update the base API URL and/or tenant identifier property in the `environments/environment.ts` file and `environments/environment.prod.ts` file for development and production use respectively.

By default OAuth2 is disabled. To enable it, change the value of oauth.enabled property to true in the `environments/environment.ts` file and `environments/environment.prod.ts` file for development and production use respectively.


## Want to help? [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/openMF/web-app/issues)

Want to file a bug, request a feature, contribute some code, or improve documentation? Excellent! Read up on our guidelines for [contributing](.github/CONTRIBUTING.md) and then check out one of our [issues](https://github.com/openMF/web-app/issues). Make sure you follow the guidelines before sending a contribution!
