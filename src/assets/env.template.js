(function (window) {
  window['env'] = window['env'] || {};

  // BackEnd Environment variables
  window['env']['fineractApiUrls'] = '$FINERACT_API_URLS';
  window['env']['fineractApiUrl'] = '$FINERACT_API_URL';

  window['env']['apiProvider'] = '$FINERACT_API_PROVIDER';
  window['env']['apiVersion'] = '$FINERACT_API_VERSION';

  window['env']['fineractPlatformTenantId'] = '$FINERACT_PLATFORM_TENANT_IDENTIFIER';

  window['env']['authServerUrl'] = '$AUTH_SERVER_URL';
  window['env']['keycloakRealm'] = '$KEYCLOAK_REALM';
  window['env']['keycloakClientId'] = '$KEYCLOAK_CLIENT_ID';

  // Language Environment variables
  window['env']['defaultLanguage'] = '$MIFOS_DEFAULT_LANGUAGE';
  window['env']['supportedLanguages'] = '$MIFOS_SUPPORTED_LANGUAGES';

  window['env']['homeURL'] = '$HOST_HOME_URL';

  // Head Office ID
  window['env']['headOfficeID'] = '$headOfficeID';

  //Matomo instance config
  window['env']['matomoSiteId'] = '$MATOMO_SITE_ID';
  window['env']['matomoSiteUrl'] = '$MATOMO_SITE_URL';
})(this);
