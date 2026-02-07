/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

(function (window) {
  window['env'] = window['env'] || {};

  // BackEnd Environment variables
  window['env']['fineractApiUrls'] = '$FINERACT_API_URLS';

  window['env']['fineractApiUrl'] = '$FINERACT_API_URL';

  window['env']['apiProvider'] = '$FINERACT_API_PROVIDER';

  window['env']['apiVersion'] = '$FINERACT_API_VERSION';

  window['env']['apiActuator'] = '$FINERACT_API_ACTUATOR';

  window['env']['fineractPlatformTenantId'] = '$FINERACT_PLATFORM_TENANT_IDENTIFIER';

  window['env']['fineractPlatformTenantIds'] = '$FINERACT_PLATFORM_TENANTS_IDENTIFIER';

  window['env']['tenantLogoUrl'] = '$TENANT_LOGO_URL';
  window['env']['tenantLogoUrlDark'] = '$TENANT_LOGO_URL_DARK';

  // Language Environment variables
  window['env']['defaultLanguage'] = '$MIFOS_DEFAULT_LANGUAGE';

  window['env']['supportedLanguages'] = '$MIFOS_SUPPORTED_LANGUAGES';

  window['env']['preloadClients'] = '$MIFOS_PRELOAD_CLIENTS';

  // Char delimiter to Export CSV options: ',' ';' '|' ' '
  window['env']['defaultCharDelimiter'] = '$MIFOS_DEFAULT_CHAR_DELIMITER';

  // Display or not the Server Selector
  window['env']['allowServerSwitch'] = '$MIFOS_ALLOW_SERVER_SWITCH_SELECTOR';

  // Display or not the BackEnd Info
  window['env']['displayBackEndInfo'] = '$MIFOS_DISPLAY_BACKEND_INFO';

  // Show minimal production hero on login page
  window['env']['productionMode'] = '$MIFOS_PRODUCTION_MODE';

  // Display or not the Tenant Selector
  window['env']['displayTenantSelector'] = '$MIFOS_DISPLAY_TENANT_SELECTOR';

  // Documentation base URL for in-app help links
  window['env']['documentationBaseUrl'] = '$MIFOS_DOCUMENTATION_BASE_URL';

  // Time in seconds for Notifications, default 60 seconds
  window['env']['waitTimeForNotifications'] = '$MIFOS_WAIT_TIME_FOR_NOTIFICATIONS';

  // Time in seconds for COB Catch-Up, default 30 seconds
  window['env']['waitTimeForCOBCatchUp'] = '$MIFOS_WAIT_TIME_FOR_CATCHUP';

  // Time in milliseconds for Session idle timeout, default 300000 seconds
  window['env']['sessionIdleTimeout'] = '$MIFOS_SESSION_IDLE_TIMEOUT';

  // OAuth Server Enabled
  window['env']['oauthServerEnabled'] = '$MIFOS_OAUTH_SERVER_ENABLED';

  // OAuth Server URL
  window['env']['oauthServerUrl'] = '$MIFOS_OAUTH_SERVER_URL';

  // OAuth Server Logout URL
  window['env']['oauthServerLogoutUrl'] = '$MIFOS_OAUTH_SERVER_LOGOUT_URL';

  // OAuth Client Id
  window['env']['oauthAppId'] = '$MIFOS_OAUTH_CLIENT_ID';

  // OAuth Authorize URL
  window['env']['oauthAuthorizeUrl'] = '$MIFOS_OAUTH_AUTHORIZE_URL';

  // OAuth Token URL
  window['env']['oauthTokenUrl'] = '$MIFOS_OAUTH_TOKEN_URL';

  // OAuth Redirect URI
  window['env']['oauthRedirectUri'] = '$MIFOS_OAUTH_REDIRECT_URI';

  // OAuth Scope
  window['env']['oauthScope'] = '$MIFOS_OAUTH_SCOPE';

  // Min Password length
  window['env']['minPasswordLength'] = '$MIFOS_MIN_PASSWORD_LENGTH';

  // Enable or Disable HTTP Cache
  window['env']['httpCacheEnabled'] = '$MIFOS_HTTP_CACHE_ENABLED';

  // Hide client data (mask names)
  window['env']['complianceHideClientData'] = '$MIFOS_COMPLIANCE_HIDE_CLIENT_DATA';

  window['env']['mifosInterbankTransfersApiUrl'] = '$MIFOS_INTERBANK_TRANSFERS_API_URL';
  window['env']['mifosInterbankTransfersApiProvider'] = '$MIFOS_INTERBANK_TRANSFERS_API_PROVIDER';
  window['env']['mifosInterbankTransfersApiVersion'] = '$MIFOS_INTERBANK_TRANSFERS_API_VERSION';
  window['env']['mifosInterbankTransfersEnabled'] = '$MIFOS_INTERBANK_TRANSFERS_ENABLED';

  // Enable Role-Based Access Control (RBAC) for menu/button permissions
  // Set to 'true' to enable RBAC, 'false' (default) for backward compatibility
  window['env']['productionModeEnableRBAC'] = '$MIFOS_PRODUCTION_MODE_ENABLE_RBAC';

  // OIDC Plugin Environment variables
  window['env']['oidcServerEnabled'] = '$FINERACT_PLUGIN_OIDC_ENABLED';
  window['env']['oidcBaseUrl'] = '$FINERACT_PLUGIN_OIDC_BASE_URL';
  window['env']['oidcClientId'] = '$FINERACT_PLUGIN_OIDC_CLIENT_ID';
  window['env']['oidcApiUrl'] = '$FINERACT_PLUGIN_OIDC_API_URL';
  window['env']['oidcFrontUrl'] = '$FINERACT_PLUGIN_OIDC_FRONTEND_URL';
})(this);
