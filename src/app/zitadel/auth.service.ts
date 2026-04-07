import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { AlertService } from '../../app/core/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';

/** Custom Services */
import { AuthenticationService } from '../core/authentication/authentication.service';
import { Credentials } from '../core/authentication/credentials.model';
import { OAuth2Token } from '../core/authentication/o-auth2-token.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.OIDC.oidcBaseUrl;
  private authUrl = `${this.baseUrl}oauth/v2/authorize`;
  private tokenUrl = `${this.baseUrl}oauth/v2/token`;
  private clientId = environment.OIDC.oidcClientId;
  private api = environment.OIDC.oidcApiUrl;
  private frontUrl = environment.OIDC.oidcFrontUrl;
  private redirectUri = `${this.frontUrl}#/callback`;
  private refreshTimeoutId: any = null;
  constructor(
    private authenticationService: AuthenticationService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  async login() {
    const codeVerifier = this.generateRandomString();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    localStorage.setItem('code_verifier', codeVerifier);
    const url =
      `${this.authUrl}` +
      `?client_id=${encodeURIComponent(this.clientId)}` +
      `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
      `&response_type=code` +
      `&scope=openid profile email offline_access` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256`;
    window.location.href = url;
  }

  logout() {
    const idToken = localStorage.getItem('id_token');
    const postLogoutRedirectUri = this.frontUrl + '#/login';

    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    if (!idToken) {
      window.location.href = postLogoutRedirectUri;
      return;
    }

    sessionStorage.removeItem('mifosXCredentials');
    sessionStorage.removeItem('mifosXZitadelTokenDetails');
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_in');
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refresh_expires_in');
    localStorage.removeItem('token_start_time');
    localStorage.removeItem('code_verifier');
    localStorage.removeItem('mifosXZitadel');
    localStorage.removeItem('auth_code');

    const logoutUrl = `${this.baseUrl}/oidc/v1/end_session?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;
    window.location.href = logoutUrl;
  }

  getAccessToken(): string | null {
    const rawToken = sessionStorage.getItem('mifosXZitadelTokenDetails');

    if (rawToken) {
      const parsedToken: OAuth2Token = JSON.parse(rawToken);
      return parsedToken.access_token;
    }

    return null;
  }

  generateRandomString(length = 128) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  async generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64;
  }

  exchangeCodeForTokens(code: string, codeVerifier: string | null) {
    const payload = {
      code: code,
      code_verifier: codeVerifier || ''
    };

    fetch(this.api + 'authentication/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error exchanging code: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(
        (tokens: {
          access_token: string;
          id_token: string;
          refresh_token: string;
          expires_in: number;
          token_type: string;
        }) => {
          const token: OAuth2Token = {
            access_token: tokens.access_token,
            token_type: tokens.token_type,
            refresh_token: tokens.refresh_token,
            expires_in: tokens.expires_in,
            scope: 'Bearer'
          };

          localStorage.setItem('id_token', tokens.id_token);
          localStorage.setItem('mifosXZitadel', 'true');
          sessionStorage.setItem('mifosXZitadelTokenDetails', JSON.stringify(token));
          localStorage.setItem('refresh_token', tokens.refresh_token);
          this.scheduleRefresh(tokens.expires_in);
          localStorage.removeItem('auth_code');
          localStorage.removeItem('code_verifier');
          this.userdetails();
        }
      )
      .catch((error) => {
        localStorage.removeItem('auth_code');
        localStorage.removeItem('code_verifier');
        window.location.href = '/#/login';
      });
  }

  userdetails() {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    fetch(this.api + 'authentication/userdetails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: accessToken })
    })
      .then((res) => {
        if (!res.ok) {
          this.alertService.alert({
            type: 'User Details',
            message: this.translateService.instant('errors.Username or password incorrect.')
          });
          this.sesionEnd();
          return false;
        }
        return res.json();
      })
      .then((userInfo) => {
        const user = userInfo.object;
        const credentials: Credentials = user;
        this.authenticationService.saveZitadelCredentials(credentials);
        window.location.href = '/#/home';
      })
      .catch((error) => {
        this.alertService.alert({ type: 'User Details', message: error });
      });
  }

  public deletUser(userId: string) {
    fetch(`${this.api}authentication/user/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAccessToken()}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200) {
          this.router.navigate(['/appusers']);
        } else {
          alert(data.msg);
        }
      })
      .catch((error) => {
        alert(error.msg);
      });
  }

  public activeUser(userId: string) {
    fetch(`${this.api}authentication/user/act/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAccessToken()}`
      },
      body: JSON.stringify({ userId })
    })
      .then((res) => res.json())
      .then((data) => {
        window.location.reload();
      })
      .catch((error) => {
        alert(error.msg);
      });
  }

  public desactiveUser(userId: string) {
    fetch(`${this.api}authentication/user/des/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAccessToken()}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        window.location.reload();
      })
      .catch((error) => {
        alert(error.msg);
      });
  }

  public getUsers() {
    let getUsers: any[] = [];
    fetch(`${this.api}authentication/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAccessToken()}`
      }
    })
      .then((res) => res.json())
      .then((response) => {
        const users = response.data?.result;
        if (Array.isArray(users)) {
          users.forEach((element: { human: any }) => {
            const human = element.human;
            if (human) {
              getUsers.push(human);
            }
          });
        }
      })
      .catch((error) => console.error(`Error retrieving users: ${error}`));
  }

  public createRole(roleKey: string, displayName: string, group: string) {
    fetch(`${this.api}authentication/role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAccessToken()}`
      },
      body: JSON.stringify({ roleKey, displayName, group })
    })
      .then((res) => res.json())
      .then((data) => {})
      .catch((error) => {
        alert(error.msg);
      });
  }

  public updateRole(roleKey: string, displayName: string, group: string) {
    fetch(`${this.api}authentication/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAccessToken()}`
      },
      body: JSON.stringify({ roleKey, displayName, group })
    })
      .then((res) => res.json())
      .then((data) => {})
      .catch((error) => {
        alert(error.msg);
      });
  }

  public deleteRole(roleKey: string) {
    fetch(`${this.api}authentication/role/${roleKey}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAccessToken()}`
      },
      body: JSON.stringify({ roleKey })
    })
      .then((res) => res.json())
      .then((data) => {})
      .catch((error) => {
        alert(error.msg);
      });
  }

  refreshToken(): Promise<void> {
    return new Promise((resolve, reject) => {
      const rt = localStorage.getItem('refresh_token');

      if (!rt) {
        //this.logout();
        return reject('Sin refresh_token');
      }

      const payload = new URLSearchParams();
      payload.set('grant_type', 'refresh_token');
      payload.set('refresh_token', rt);
      payload.set('client_id', this.clientId);

      fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload.toString()
      })
        .then((res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(text);
            });
          }
          return res.json();
        })
        .then((tokens) => {
          if (!tokens || !tokens.access_token || !tokens.expires_in) {
            throw new Error("The server's response does not contain the expected fields.");
          }
          localStorage.setItem('access_token', tokens.access_token);
          localStorage.setItem('id_token', tokens.id_token ?? '');
          localStorage.setItem('refresh_token', tokens.refresh_token ?? '');
          localStorage.setItem('expires_in', tokens.expires_in.toString());
          localStorage.setItem('refresh_expires_in', tokens.refresh_expires_in?.toString() ?? '');
          localStorage.setItem('token_start_time', Date.now().toString());
          this.scheduleRefresh(tokens.expires_in);
          resolve();
        })
        .catch((err) => {
          setTimeout(() => {
            //this.logout();
          }, 300000);
          reject(err);
        });
    });
  }

  private scheduleRefresh(expiresIn: number) {
    const refreshInMs = (expiresIn - 3539) * 1000;
    if (refreshInMs <= 0) {
      this.refreshToken();
      return;
    }

    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
    }

    this.refreshTimeoutId = setTimeout(() => {
      this.refreshToken();
    }, refreshInMs);
  }

  async sesionEnd() {
    const idToken = localStorage.getItem('id_token');
    const postLogoutRedirectUri = this.frontUrl + '#/login';

    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    if (!idToken) {
      window.location.href = postLogoutRedirectUri;
      return;
    }

    const logoutUrl = `${this.baseUrl}oidc/v1/end_session?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;

    try {
      const response = await fetch(logoutUrl, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Error en logout:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error de red en logout:', error);
    } finally {
      sessionStorage.removeItem('mifosXCredentials');
      sessionStorage.removeItem('mifosXZitadelTokenDetails');
      localStorage.removeItem('access_token');
      localStorage.removeItem('expires_in');
      localStorage.removeItem('id_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('refresh_expires_in');
      localStorage.removeItem('token_start_time');
      localStorage.removeItem('code_verifier');
      localStorage.removeItem('mifosXZitadel');
      localStorage.removeItem('auth_code');
    }
  }
}
