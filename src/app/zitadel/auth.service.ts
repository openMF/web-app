import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { AuthenticationService } from '../core/authentication/authentication.service';
import { Credentials } from '../core/authentication/credentials.model';
import { OAuth2Token } from '../core/authentication/o-auth2-token.model';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.OIDC.oidcBaseUrl;
  private authUrl = `${this.baseUrl}oauth/v2/authorize`;
  private tokenUrl = `${this.baseUrl}oauth/v2/token`;
  private clientId = environment.OIDC.oidcClientId;
  private api = environment.OIDC.oidcApiUrl;
  private frontUrl = environment.OIDC.oidcFrontUrl;
  private redirectUri = `${this.frontUrl}#/login`;
  private refreshTimeoutId: any = null;

  constructor(
    private authenticationService: AuthenticationService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
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
    //return;
    const idToken = localStorage.getItem('id_token');
    const postLogoutRedirectUri = this.frontUrl + '#/login';

    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    if (!idToken) {
      //console.warn('No id_token found. Redirecting to login.');
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
        //console.error('Error exchanging the code for tokens:', error);
        localStorage.removeItem('auth_code');
        localStorage.removeItem('code_verifier');
      });
  }

  userdetails() {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      //console.error('No access token found');
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
          throw new Error('Error retrieving user data from backend');
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
        //console.error('Error consuming backend:', error);
      });
  }

  // Delete
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
        //console.log(data);
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

  // Activar
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
        //console.error('Error activating user:', error);
      });
  }

  // Desactive
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
        //console.error('Error deactivating user:', error);
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
          //console.log(getUsers);
        } else {
          //console.error('The response does not contain valid users');
        }
      })
      .catch((error) => console.error(`Error retrieving users: ${error}`));
  }

  /*** CRUD to Role */
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
      .then((data) => {
        // Registro exitoso
      })
      .catch((error) => {
        alert(error.msg);
        //console.error('Error creating Role:', error);
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
        //console.error('Error updating Role:', error);
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
        //console.error(error.msg);
      });
  }

  refreshToken(): Promise<void> {
    return new Promise((resolve, reject) => {
      const rt = localStorage.getItem('refresh_token');

      if (!rt) {
        //console.warn('No refresh_token exists in localStorage. You must log in again.');
        //console.log("logout from refreshToken");
        //this.logout();
        return reject('Sin refresh_token');
      }

      const payload = new URLSearchParams();
      payload.set('grant_type', 'refresh_token');
      payload.set('refresh_token', rt);
      payload.set('client_id', this.clientId);

      //console.log('Iniciando refreshToken()');

      fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload.toString()
      })
        .then((res) => {
          if (!res.ok) {
            //console.error(`Error HTTP en refresh: ${res.status} ${res.statusText}`);
            return res.text().then((text) => {
              //console.error('Cuerpo de error:', text);
              throw new Error(text);
            });
          }
          return res.json();
        })
        .then((tokens) => {
          //console.log('Respuesta del token refresh:', tokens);

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
          //console.warn('refreshToken failed, forcing logout in 2 seconds');
          //console.warn('→ Error:', err);
          //console.warn('→ refresh_token usado:', rt);
          setTimeout(() => {
            //console.log('Forcing logout after refreshToken error');
            //this.logout();
          }, 300000);

          reject(err);
        });
    });
  }

  private scheduleRefresh(expiresIn: number) {
    const refreshInMs = (expiresIn - 3539) * 1000;
    if (refreshInMs <= 0) {
      //console.log('expiresIn too small or negative, refreshing immediately');
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
}
