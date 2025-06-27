# @fineract/client@1.0.0

Apache Fineract is a secure, multi-tenanted microfinance platform The goal of the Apache Fineract API is to empower developers to build apps on top of the Apache Fineract Platform<br>The [reference app](https://cui.fineract.dev) (username: mifos, password: password) works on the same demo tenant as the interactive links in this documentation - The API is organized around [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) - Find out more about Apache Fineract [here](/fineract-provider/api-docs/apiLive.htm#top) - You can [Try The API From Your Browser](/fineract-provider/api-docs/apiLive.htm#interact) - The Generic Options are available [here](/fineract-provider/api-docs/apiLive.htm#genopts) - Find out more about [Updating Dates and Numbers](/fineract-provider/api-docs/apiLive.htm#dates_and_numbers) - For the Authentication and the Basic of HTTP and HTTPS refer [here](/fineract-provider/api-docs/apiLive.htm#authentication_overview) - Check about ERROR codes [here](/fineract-provider/api-docs/apiLive.htm#errors) Please refer to the [old documentation](/fineract-provider/api-docs/apiLive.htm) for any documentation queries

The version of the OpenAPI document: 1.6.1-9329b991

## Building

To install the required dependencies and to build the typescript sources run:

```console
npm install
npm run build
```

## Publishing

First build the package then run `npm publish dist` (don't forget to specify the `dist` folder!)

## Consuming

Navigate to the folder of your consuming project and run one of next commands.

_published:_

```console
npm install @fineract/client@1.0.0 --save
```

_without publishing (not recommended):_

```console
npm install PATH_TO_GENERATED_PACKAGE/dist.tgz --save
```

_It's important to take the tgz file, otherwise you'll get trouble with links on windows_

_using `npm link`:_

In PATH_TO_GENERATED_PACKAGE/dist:

```console
npm link
```

In your project:

```console
npm link @fineract/client
```

**Note for Windows users:** The Angular CLI has troubles to use linked npm packages.
Please refer to this issue <https://github.com/angular/angular-cli/issues/8284> for a solution / workaround.
Published packages are not effected by this issue.

### General usage

In your Angular project:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideApi } from '@fineract/client';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideHttpClient(),
    provideApi()
  ]
};
```

**NOTE**
If you're still using `AppModule` and haven't [migrated](https://angular.dev/reference/migrations/standalone) yet, you can still import an Angular module:

```typescript
import { ApiModule } from '@fineract/client';
```

If different from the generated base path, during app bootstrap, you can provide the base path to your service.

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideApi } from '@fineract/client';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideHttpClient(),
    provideApi('http://localhost:9999')
  ]
};
```

```typescript
// with a custom configuration
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideApi } from '@fineract/client';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideHttpClient(),
    provideApi({
      withCredentials: true,
      username: 'user',
      password: 'password'
    })
  ]
};
```

```typescript
// with factory building a custom configuration
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideApi, Configuration } from '@fineract/client';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideHttpClient(),
    {
      provide: Configuration,
      useFactory: (authService: AuthService) =>
        new Configuration({
          basePath: 'http://localhost:9999',
          withCredentials: true,
          username: authService.getUsername(),
          password: authService.getPassword()
        }),
      deps: [AuthService],
      multi: false
    }
  ]
};
```

### Using multiple OpenAPI files / APIs

In order to use multiple APIs generated from different OpenAPI files,
you can create an alias name when importing the modules
in order to avoid naming conflicts:

```typescript
import { provideApi as provideUserApi } from 'my-user-api-path';
import { provideApi as provideAdminApi } from 'my-admin-api-path';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideHttpClient(),
    provideUserApi(environment.basePath),
    provideAdminApi(environment.basePath)
  ]
};
```

### Customizing path parameter encoding

Without further customization, only [path-parameters][parameter-locations-url] of [style][style-values-url] 'simple'
and Dates for format 'date-time' are encoded correctly.

Other styles (e.g. "matrix") are not that easy to encode
and thus are best delegated to other libraries (e.g.: [@honoluluhenk/http-param-expander]).

To implement your own parameter encoding (or call another library),
pass an arrow-function or method-reference to the `encodeParam` property of the Configuration-object
(see [General Usage](#general-usage) above).

Example value for use in your Configuration-Provider:

```typescript
new Configuration({
  encodeParam: (param: Param) => myFancyParamEncoder(param)
});
```

[parameter-locations-url]: https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameter-locations
[style-values-url]: https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#style-values
[@honoluluhenk/http-param-expander]: https://www.npmjs.com/package/@honoluluhenk/http-param-expander
