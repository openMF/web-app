import env from './env';

export const environment = {
  production: false,
  version: env.mifos_x_version + '-dev',
  fineractPlatformTenantId: 'default',  // For connecting to server running elsewhere update the tenant identifier
  baseApiUrl: 'https://dev.mifos.io',  // For connecting to server running elsewhere update the base API URL
  apiProvider: '/fineract-provider/api',
  apiVersion: '/v1',
  serverUrl: '',
  oauth: {
    enabled: false,  // For connecting to Mifos X using OAuth2 Authentication change the value to true
    serverUrl: ''
  },
  defaultLanguage: 'en-US',
  supportedLanguages: [
    'en-US',
    'fr-FR'
  ]
};

function queryParameters(): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  if (window.location.search) {
    const params = window.location.search.slice(1).split('&');
    for (let i = 0; i < params.length; i++) {
      const tmp = params[i].split('=');
      result[tmp[0]] = unescape(tmp[1]);
    }
  }
  return result;
}

// Server URL
environment.serverUrl = `${environment.baseApiUrl}${environment.apiProvider}${environment.apiVersion}`;
environment.oauth.serverUrl = `${environment.baseApiUrl}${environment.apiProvider}`;

if (env.allow_switching_backend_instance) {
  const queryParamMap = queryParameters();
  if (!!queryParamMap.baseApiUrl && !!queryParamMap.apiProvider && !!queryParamMap.apiVersion) {
    environment.baseApiUrl = queryParamMap.baseApiUrl;
    environment.apiProvider = queryParamMap.apiProvider;
    environment.apiVersion = queryParamMap.apiVersion;

    environment.serverUrl = `${environment.baseApiUrl}${environment.apiProvider}${environment.apiVersion}`;
    environment.oauth.serverUrl = `${environment.baseApiUrl}${environment.apiProvider}`;
  }
}
