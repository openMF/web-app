(function(window) {
  window["env"] = window["env"] || {};

  // BackEnd Environment variables
  window["env"]["fineractApiUrls"] = 'https://dev.mifos.io,https://demo.mifos.io,https://qa.mifos.io,https://staging.mifos.io,https://mobile.mifos.io,https://loans.test.oneacrefund.org,https://localhost:8443';
  window["env"]["fineractApiUrl"]  = 'https://loans.test.oneacrefund.org';

  window['env']['authServerUrl']  = 'https://accounts.test.oneacrefund.org';

  window["env"]["apiProvider"] = '/fineract-provider/api';
  window["env"]["apiVersion"]  = '/v1';

  window["env"]["fineractPlatformTenantId"]  = '';

  // Language Environment variables
  window["env"]["defaultLanguage"] = '';
  window["env"]["supportedLanguages"] = '';
  // Head Office ID
  window["env"]["headOfficeID"] = '';
})(this);
