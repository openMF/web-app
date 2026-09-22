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
  window['env']['fineractApiUrls'] = 'https://ps-test.dev.alluvial.cloud';

  window['env']['fineractApiUrl'] = 'https://ps-test.dev.alluvial.cloud';

  window['env']['apiProvider'] = '';

  window['env']['apiVersion'] = '';

  window['env']['apiActuator'] = '';

  window['env']['fineractPlatformTenantId'] = 'pstest';

  window['env']['fineractPlatformTenantIds'] = 'pstest';

  window['env']['tenantLogoUrl'] = '';
  window['env']['tenantLogoUrlDark'] = '';

  // Language Environment variables
  window['env']['defaultLanguage'] = '';

  window['env']['supportedLanguages'] = '';

  window['env']['defaultFormatDate'] = '';
  window['env']['defaultFormatDatetime'] = '';

  window['env']['preloadClients'] = '';

  // Char delimiter to Export CSV options: ',' ';' '|' ' '
  window['env']['defaultCharDelimiter'] = '';

  // Display or not the Server Selector
  window['env']['allowServerSwitch'] = '';

  // Display or not the BackEnd Info in the footer and the Login view.
  // Regardless of this setting, it is always available in Admin > System > System Information
  window['env']['displayBackEndInfo'] = '';

  // Show minimal production hero on login page
  window['env']['productionMode'] = '';
  window['env']['enableGlobalDashboard'] = '';

  // Enable Global Dashboard feature
  window['env']['enableGlobalDashboard'] = '';

  // Display or not the Tenant Selector
  window['env']['displayTenantSelector'] = '';

  // Documentation base URL for in-app help links
  window['env']['documentationBaseUrl'] = '';

  // Time in seconds for Notifications, default 60 seconds
  window['env']['waitTimeForNotifications'] = '';

  // Time in seconds for COB Catch-Up, default 30 seconds
  window['env']['waitTimeForCOBCatchUp'] = '';

  // Time in milliseconds for Session idle timeout, default 300000 seconds
  window['env']['sessionIdleTimeout'] = '0';

  // OAuth Server Enabled
  window['env']['oauthServerEnabled'] = '';

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

  // Min Password length
  window['env']['minPasswordLength'] = '';

  // Password Regex
  window['env']['minPasswordLength'] = '';

  // Enable or Disable HTTP Cache
  window['env']['httpCacheEnabled'] = '';

  // Hide client data (mask names)
  window['env']['complianceHideClientData'] = '';

  window['env']['mifosInterbankTransfersApiUrl'] = '';
  window['env']['mifosInterbankTransfersApiProvider'] = '';
  window['env']['mifosInterbankTransfersApiVersion'] = '';
  window['env']['mifosInterbankTransfersEnabled'] = '';
  window['env']['cbIldEnabled'] = '';
  window['env']['pluginBaseUrl'] = '';

  // Remittance Module Environment variables
  window['env']['mifosRemittanceApiClientUrl'] = '';
  window['env']['mifosRemittanceApiProvider'] = '';
  window['env']['mifosRemittanceApiVersion'] = '';
  window['env']['mifosRemittanceEnabled'] = '';
  window['env']['mifosRemittanceApiClientHeader'] = '';
  window['env']['mifosRemittanceApiClientKey'] = '';

  // Mifos Copilot AI assistant
  // Set MIFOS_ENABLE_COPILOT=true to load the Copilot panel for this deployment (off by default)
  window['env']['enableCopilot'] = '';
  // Base URL of the Copilot gateway, which holds the LLM key server-side and runs banking
  // tools as the logged-in officer. Leave unset to use the built-in mock responses.
  window['env']['copilotMcpBaseUrl'] = '';

  // Enable Role-Based Access Control (RBAC) for menu/button permissions
  // Set to 'true' to enable RBAC, 'false' (default) for backward compatibility
  window['env']['productionModeEnableRBAC'] = '';

  // External National ID System Integration
  // API key is injected server-side via nginx proxy_set_header — not exposed to browser
  window['env']['enableExternalNationalIdSystem'] = '';
  window['env']['externalNationalIdSystemUrl'] = '';
  window['env']['externalNationalIdSystemApiHeader'] = '';
  window['env']['externalNationalIdSystemApiKey'] = '';
  window['env']['externalNationalIdRegex'] = '';

  // Email format validation regex (optional override; leave unset to use the built-in default)
  window['env']['externalEmailRegex'] = '';

  // Client Address Location (latitude, longitude, and map)
  window['env']['enableClientAddressLocation'] = '';

  // OIDC Plugin Environment variables
  window['env']['oidcServerEnabled'] = '';
  window['env']['oidcBaseUrl'] = '';
  window['env']['oidcClientId'] = '';
  window['env']['oidcApiUrl'] = '';
  window['env']['oidcFrontUrl'] = '';
})(this);
