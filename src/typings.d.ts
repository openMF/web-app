/*
 * Extra typings definitions
 */

// Allow .json files imports
declare module '*.json';

// SystemJS module definition
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

// Extend the global Window interface to include `env`
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
    /** Production mode - when true, shows minimal hero with only branding at bottom */
    productionMode?: string | boolean;
    waitTimeForNotifications?: number;
    waitTimeForCOBCatchUp?: number;
    sessionIdleTimeout?: number;
    mifosInterbankTransfersApiUrl?: string;
    mifosInterbankTransfersApiProvider?: string;
    mifosInterbankTransfersApiVersion?: string;
    mifosInterbankTransfersEnabled?: boolean;
    minPasswordLength?: number;
  };
}

declare module 'chart.js';
