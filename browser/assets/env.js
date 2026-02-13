/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

(function(window) {
  window["env"] = window["env"] || {};

  // BackEnd Environment variables
  window["env"]["fineractApiUrls"] = '';
  window["env"]["fineractApiUrl"]  = '';

  window["env"]["apiProvider"] = '';
  window["env"]["apiVersion"]  = '';
  window["env"]["apiActuator"]  = '';

  window["env"]["fineractPlatformTenantId"]  = '';
  window["env"]["fineractPlatformTenantIds"]  = '';

  window['env']['tenantLogoUrl'] = '';
  window['env']['tenantLogoUrlDark'] = '';

  // Language Environment variables
  window["env"]["defaultLanguage"] = '';
  window["env"]["supportedLanguages"] = '';

  window['env']['preloadClients'] = '';

  // Char delimiter to Export CSV options: ',' ';' '|' ' '
  window['env']['defaultCharDelimiter'] = '';

  // Display or not the Server Selector
  window['env']['allowServerSwitch'] = '';
  
  // Display or not the BackEnd Info
  window['env']['displayBackEndInfo'] = '';

  // Show minimal production hero on login page
  window['env']['productionMode'] = '';

  // Display or not the Tenant Selector
  window['env']['displayTenantSelector'] = '';

  // Time in seconds for Notifications, default 60 seconds
  window['env']['waitTimeForNotifications'] = '';

  // Time in seconds for COB Catch-Up, default 30 seconds
  window['env']['waitTimeForCOBCatchUp'] = '';

  // Time in milliseconds for Session idle timeout, default 300000 seconds
  window['env']['sessionIdleTimeout'] = '0';

  // OAuth Server Enabled
  window['env']['oauthServerEnabled'] = false;

  // OAuth Server URL
  window['env']['oauthServerUrl'] = '';

  // OAuth Server Logout URL
  window['env']['oauthServerLogoutUrl'] = '';

  // OAuth Client Id
  window['env']['oauthAppId'] = '';

  // OAuth Authorize URL
  window['env']['oauthAuthorizeUrl'] = '';

  // OAuth Token URL
  window['env']['oauthTokenUrl'] = '';

  // OAuth Redirect URI
  window['env']['oauthRedirectUri'] = '';

  // OAuth Scope
  window['env']['oauthScope'] = '';


  // Hide client data (mask names)
  window['env']['complianceHideClientData'] = '';

   // Interbank Transfers Environment variables
  window['env']['mifosInterbankTransfersApiUrl'] = '';
  window['env']['mifosInterbankTransfersApiProvider'] = '';
  window['env']['mifosInterbankTransfersApiVersion'] = '';
  window['env']['mifosInterbankTransfersEnabled'] = 'true';
  
  // Enable Role-Based Access Control (RBAC) for menu/button permissions
  // Set to true to enable RBAC, false (default) for backward compatibility
  window['env']['productionModeEnableRBAC'] = false;

  // External National ID System
  // Set to 'true' to enable External National ID lookup during client creation/editing
  // When enabled, set EXTERNAL_NATIONAL_ID_SYSTEM_URL, API_HEADER, API_KEY, and REGEX
  // In production, API key is injected server-side via nginx proxy_set_header (never set here)
  window['env']['enableExternalNationalIdSystem'] = 'false';
  window['env']['externalNationalIdSystemUrl'] = '';
  window['env']['externalNationalIdSystemApiHeader'] = '';
  window['env']['externalNationalIdSystemApiKey'] = '';
  window['env']['externalNationalIdRegex'] = '';

  // OIDC Plugin Environment variables
  window['env']['oidcServerEnabled'] = false;
  window['env']['oidcBaseUrl']       = '';
  window['env']['oidcClientId']      = '';
  window['env']['oidcApiUrl']        = '';
  window['env']['oidcFrontUrl']      = '';

})(this);
