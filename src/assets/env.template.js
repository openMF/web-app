(function(window) {
  window["env"] = window["env"] || {};

  // BackEnd Environment variables
  window["env"]["fineractApiUrls"] = '${FINERACT_API_URLS}';
  window["env"]["fineractApiUrl"]  = '${FINERACT_API_URL}';

  window["env"]["apiProvider"] = '${FINERACT_API_PROVIDER}';
  window["env"]["apiVersion"]  = '${FINERACT_API_VERSION}';

  window["env"]["fineractPlatformTenantId"]  = '${FINERACT_PLATFORM_TENANT_IDENTIFIER}';
  window["env"]["fineractPlatformTenantIds"]  = '${FINERACT_PLATFORM_TENANTS_IDENTIFIER}';

  window["env"]["allowSwitchingBackendInstance"]  = '${ALLOW_SWITCHING_BACKEND_INSTANCE}';

  // Language Environment variables
  window["env"]["defaultLanguage"] = '${MIFOS_DEFAULT_LANGUAGE}';
  window["env"]["supportedLanguages"] = '${MIFOS_SUPPORTED_LANGUAGES}';

  window['env']['preloadClients'] = '${MIFOS_PRELOAD_CLIENTS}';

  // Char delimiter to Export CSV options: ',' ';' '|' ' '
  window['env']['defaultCharDelimiter'] = '${MIFOS_DEFAULT_CHAR_DELIMITER}';

  // Display or not the BackEnd Info
  window['env']['displayBackEndInfo'] = '${MIFOS_DISPLAY_BACKEND_INFO}';

  // Time in seconds for Notifications, default 60 seconds
  window['env']['waitTimeForNotifications'] = '${MIFOS_WAIT_TIME_FOR_NOTIFICATIONS}';

  // Time in seconds for COB Catch-Up, default 30 seconds
  window['env']['waitTimeForCOBCatchUp'] = '${MIFOS_WAIT_TIME_FOR_CATCHUP}';

  // Time in milliseconds for Session idle timeout, default 300000 seconds
  window['env']['sessionIdleTimeout'] = '${MIFOS_SESSION_IDLE_TIMEOUT}';

})(this);
