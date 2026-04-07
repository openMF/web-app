interface Window {
  env?: {
    [key: string]: any;
    fineractPlatformTenantId?: string;
    fineractPlatformTenantIds?: string;
    fineractApiUrls?: string;
    fineractApiUrl?: string;
    allow_switching_backend_instance?: boolean;
    apiProvider?: string;
    apiVersion?: string;
    oauthServerEnabled?: boolean;
    oauthServerUrl?: string;
    oauthAppId?: string;
    defaultLanguage?: string;
    supportedLanguages?: string;
    preloadClients?: boolean;
    defaultCharDelimiter?: string;
    displayBackEndInfo?: string;
    displayTenantSelector?: string;
    waitTimeForNotifications?: number;
    waitTimeForCOBCatchUp?: number;
    sessionIdleTimeout?: number;
    vNextApiUrl?: string;
    vNextApiProvider?: string;
    vNextApiVersion?: string;
    interbankTransfers?: boolean;
    minPasswordLength?: number;
  };
}
