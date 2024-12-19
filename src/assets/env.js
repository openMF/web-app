(function(window) {
  window["env"] = window["env"] || {};

  // BackEnd Environment variables
  window["env"]["fineractApiUrls"] = '';
  window["env"]["fineractApiUrl"]  = '';

  window["env"]["apiProvider"] = '';
  window["env"]["apiVersion"]  = '';

  window["env"]["fineractPlatformTenantId"]  = '';
  window["env"]["fineractPlatformTenantIds"]  = '';

  // Language Environment variables
  window["env"]["defaultLanguage"] = '';
  window["env"]["supportedLanguages"] = '';

  window['env']['preloadClients'] = '';

  // Char delimiter to Export CSV options: ',' ';' '|' ' '
  window['env']['defaultCharDelimiter'] = '';

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
  window['env']['oauthServerEnabled'] = '';

  // OAuth Server URL  
  window['env']['oauthServerUrl'] = '';

  // OAuth Client Id  
  window['env']['oauthAppId'] = '';

})(this);
