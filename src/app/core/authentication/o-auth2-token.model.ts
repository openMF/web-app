/**
 * OAuth2/OIDC token response model.
 */
export interface OAuth2Token {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  // ID token (only present in OIDC responses)
  id_token?: string;
}
