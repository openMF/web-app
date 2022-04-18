import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { LOCATION_INITIALIZED } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { environment } from 'environments/environment';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient.disableApiPrefix());
}

export function ApplicationInitializerFactory(
  translate: TranslateService, injector: Injector) {
  return async () => {
    await injector.get(LOCATION_INITIALIZED, Promise.resolve(null));

    const deaultLang = environment.defaultLanguage;
    console.log(`Initialized ${deaultLang} language`);
    translate.addLangs(environment.supportedLanguages);
    try {
      console.log(`Initialized ${deaultLang} language`);
      await translate.use(deaultLang).toPromise();
      console.log(`Successfully initialized ${deaultLang} language.`);
    } catch (err) {
      console.log(err);
    }
    console.log(`Successfully initialized ${deaultLang} language.`);
  };
}
