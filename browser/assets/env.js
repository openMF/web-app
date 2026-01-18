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

  // OAuth Client Id
  window['env']['oauthAppId'] = '';


  // Hide client data (mask names)
  window['env']['complianceHideClientData'] = '';

  // OIDC Plugin Environment variables
  window['env']['oidcServerEnabled'] = false;
  window['env']['oidcBaseUrl']       = '';
  window['env']['oidcClientId']      = '';
  window['env']['oidcApiUrl']        = '';
  window['env']['oidcFrontUrl']      = '';

})(this);
