/**
 * OAuth2 token model.
 */
export interface OAuth2Token {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}
