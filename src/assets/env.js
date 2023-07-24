(function(window) {
  window["env"] = window["env"] || {};

  // BackEnd Environment variables
  window["env"]["fineractApiUrls"] = 'https://ps-test.dev.alluvial.cloud';
  window["env"]["fineractApiUrl"]  = 'https://ps-test.dev.alluvial.cloud';

  window["env"]["apiProvider"] = '';
  window["env"]["apiVersion"]  = '';

  window["env"]["fineractPlatformTenantId"]  = 'pstest';
  window["env"]["fineractPlatformTenantIds"]  = 'pstest';

  // Language Environment variables
  window["env"]["defaultLanguage"] = '';
  window["env"]["supportedLanguages"] = '';

  window['env']['preloadClients'] = '';

  // Char delimiter to Export CSV options: ',' ';' '|' ' '
  window['env']['defaultCharDelimiter'] = '';

  // Display or not the BackEnd Info
  window['env']['displayBackEndInfo'] = '';

})(this);
