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

export interface CoopProfile {
  coopRegdNo: string;
  nameNp: string;
  nameEn: string;
  dateOfRegistered: string;
  panNo: string;
  provinceId: number | null;
  districtId: number | null;
  localLevelId: number | null;
  wardNo: number | null;
  tole: string;
  houseNo: string;
  mobilePhone: string;
  officePhone: string;
  logoUrl: string;
  webUrl: string;
  about: string;
  remarks: string;
}

export interface CoopLocation {
  id: number;
  combinedCode: string;

  provinceCode: string;
  provinceNameEn: string;
  provinceNameNp: string;

  districtCode: string;
  districtNameEn: string;
  districtNameNp: string;

  localLevelCode: string;
  localLevelNameEn: string;
  localLevelNameNp: string;

  ecologicalBelt: string;
  totalWard: number;
  isActive: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class CoopProfileService {
  private http = inject(HttpClient);

  private readonly profileUrl = `${environment.coopApiUrl}/nepal/coop-registration/public/profile`;

  createProfile(profile: CoopProfile): Observable<CoopProfile> {
    return this.http.post<CoopProfile>(this.profileUrl, profile);
  }

  getProfile(): Observable<CoopProfile> {
    return this.http.get<CoopProfile>(this.profileUrl);
  }

  updateProfile(profile: Partial<CoopProfile>): Observable<CoopProfile> {
    return this.http.patch<CoopProfile>(this.profileUrl, profile);
  }

  getLocations(): Observable<CoopLocation[]> {
    return this.http.get<CoopLocation[]>(`${environment.coopApiUrl}/nepal/coop-registration/public/locations`);
  }
}
