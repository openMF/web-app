import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private oauthService = inject(OAuthService);
  private api = environment.OIDC.oidcApiUrl;

  getAccessToken(): string | null {
    return this.oauthService.getAccessToken();
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

  async refreshToken(): Promise<void> {
    try {
      await this.oauthService.refreshToken();
    } catch (error) {
      throw error;
    }
  }
}
