(function(window) {
  window["env"] = window["env"] || {};

  // BackEnd Environment variables
  window["env"]["fineractApiUrls"] = '$FINERACT_API_URLS';
  window["env"]["fineractApiUrl"]  = '$FINERACT_API_URL';

  window["env"]["apiProvider"] = '$FINERACT_API_PROVIDER';
  window["env"]["apiVersion"]  = '$FINERACT_API_VERSION';

  window["env"]["fineractPlatformTenantId"]  = '$FINERACT_PLATFORM_TENANT_IDENTIFIER';

  // Language Environment variables
  window["env"]["defaultLanguage"] = '$MIFOS_DEFAULT_LANGUAGE';
  window["env"]["supportedLanguages"] = '$MIFOS_SUPPORTED_LANGUAGES';
})(this);
