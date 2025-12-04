(function(window) {
  window["env"] = window["env"] || {};

  // BackEnd Environment variables
  window["env"]["fineractApiUrls"] = "https://demo.mifos.community";
  window["env"]["fineractApiUrl"]  = "https://demo.mifos.community";

  window["env"]["apiProvider"] = "/fineract-provider/api";
  window["env"]["apiVersion"]  = "/v1";

  window["env"]["fineractPlatformTenantId"]  = "default";
  window["env"]["fineractPlatformTenantIds"] = "default";

  // Language Environment variables
  window["env"]["defaultLanguage"] = "en-US";
  window["env"]["supportedLanguages"] = "en-US";

  // Faster client load
  window['env']['preloadClients'] = true;

  // CSV delimiter
  window['env']['defaultCharDelimiter'] = ",";

  // Toggles
  window['env']['allowServerSwitch'] = "true";
  window['env']['displayBackEndInfo'] = "true";
  window['env']['displayTenantSelector'] = "true";

  // Timing
  window['env']['waitTimeForNotifications'] = "60";
  window['env']['waitTimeForCOBCatchUp'] = "30";
  window['env']['sessionIdleTimeout'] = "300000"; // 5 minutes

  // OAuth (Disabled for demo)
  window['env']['oauthServerEnabled'] = false;
  window['env']['oauthServerUrl'] = "";
  window['env']['oauthAppId'] = "";

  // OIDC Plugin (Disabled)
  window['env']['oidcServerEnabled'] = false;
  window['env']['oidcBaseUrl']  = "";
  window['env']['oidcClientId'] = "";
  window['env']['oidcApiUrl']   = "";
  window['env']['oidcFrontUrl'] = "";

})(this);