/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CoopRegisterRequest {
  email: string;
  password: string;
  phone: string;
}

export interface CoopRegisterResponse {
  userId: number;
  message?: string;
  [key: string]: any;
}

export interface CoopVerifyEmailRequest {
  userId: number;
  otp: string;
}

export interface CoopVerifyEmailResponse {
  success: boolean;
  message?: string;
  status?: 'UNVERIFIED' | 'VERIFIED';
  [key: string]: any;
}

export interface CoopLoginRequest {
  email: string;
  password: string;
}

export interface CoopLoginResponse {
  tokenType: string;
  status: 'UNVERIFIED' | 'VERIFIED';
  isEmailVerified: boolean;
  expiresIn: number;
  refreshToken: string;
  accessToken: string;
}

export interface CoopResendOtpRequest {
  email: string;
}

export interface CoopResendOtpResponse {
  userId: number;
  message?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class CoopAuthService {
  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.coopApiUrl}/nepal/coop-registration/public`;

  register(data: CoopRegisterRequest): Observable<CoopRegisterResponse> {
    return this.http.post<CoopRegisterResponse>(`${this.baseUrl}/register`, data);
  }

  verifyEmail(data: CoopVerifyEmailRequest): Observable<CoopVerifyEmailResponse> {
    return this.http.post<CoopVerifyEmailResponse>(`${this.baseUrl}/verify-email`, data);
  }

  login(data: CoopLoginRequest): Observable<CoopLoginResponse> {
    return this.http.post<CoopLoginResponse>(`${this.baseUrl}/login`, data);
  }

  resendOtp(data: CoopResendOtpRequest): Observable<CoopResendOtpResponse> {
    return this.http.post<CoopResendOtpResponse>(`${this.baseUrl}/resend-otp`, data);
  }
}
