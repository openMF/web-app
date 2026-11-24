/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { SILENT_ERRORS } from 'app/core/http/error-handler.interceptor';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import {
  ExitFilter,
  MemberNominee,
  MemberShares,
  MembershipExit,
  MembersWithoutShares,
  MembershipApplication,
  MembershipApplyRequest,
  MembershipApproveRequest,
  MembershipRejectRequest,
  MembershipSettings,
  MembershipSettingsView,
  MembershipStatus,
  MembershipTemplate,
  Nominee,
  ShareCeiling,
  OrganisationCategory,
  RelationshipOption
} from './membership.models';

/**
 * Membership applications (fineract-dbug ADR 0023; the settings, ADR 0035): a person becomes a member by buying shares. Applying creates a
 * pending client; approving activates the member, opens the member savings account and buys the shares in one step.
 */
@Injectable({ providedIn: 'root' })
export class MembershipService {
  private http = inject(HttpClient);
  private authenticationService = inject(AuthenticationService);

  /**
   * Whether the signed-in user may read memberships. Checked before calling, because the global error handler
   * shows an alert for every refused call, and a user without the permission should simply see the old screens.
   */
  canRead(): boolean {
    const permissions: string[] = this.authenticationService.getCredentials()?.permissions ?? [];
    return [
      'ALL_FUNCTIONS',
      'ALL_FUNCTIONS_READ',
      'READ_MEMBERSHIP'
    ].some((p) => permissions.includes(p));
  }

  template(): Observable<MembershipTemplate> {
    return this.http.get<MembershipTemplate>('/nepal/memberships/template');
  }

  /**
   * The template when this user may read memberships, else null. Membership mode is on when
   * {@code template.settings.shareFirstEnabled}; a user without READ_MEMBERSHIP works as before.
   */
  templateOrNull(): Observable<MembershipTemplate | null> {
    return this.canRead() ? this.template().pipe(catchError(() => of(null))) : of(null);
  }

  /** The relationships a nominee may have, in the order to show them. */
  nomineeRelationships(): Observable<RelationshipOption[]> {
    return this.http.get<RelationshipOption[]>('/nepal/relationships', {
      params: new HttpParams().set('use', 'NOMINEE')
    });
  }

  apply(request: MembershipApplyRequest): Observable<MembershipApplication> {
    return this.http.post<MembershipApplication>('/nepal/memberships', request);
  }

  list(status: MembershipStatus): Observable<MembershipApplication[]> {
    return this.http.get<MembershipApplication[]>('/nepal/memberships', {
      params: new HttpParams().set('status', status.toLowerCase())
    });
  }

  /** The member's latest application whatever its status, or null when there is none (or the user may not read it). */
  forClient(clientId: number | string): Observable<MembershipApplication | null> {
    return this.history(clientId).pipe(map((applications) => applications[0] ?? null));
  }

  /** Every application of the member, newest first; empty when there is none (or the user may not read them). */
  history(clientId: number | string): Observable<MembershipApplication[]> {
    if (!this.canRead()) {
      return of([]);
    }
    return this.http
      .get<MembershipApplication[]>('/nepal/memberships', {
        params: new HttpParams().set('clientId', String(clientId))
      })
      .pipe(catchError(() => of([])));
  }

  get(id: number): Observable<MembershipApplication> {
    return this.http.get<MembershipApplication>(`/nepal/memberships/${id}`);
  }

  approve(id: number, request: MembershipApproveRequest): Observable<MembershipApplication> {
    return this.http.post<MembershipApplication>(`/nepal/memberships/${id}`, request, {
      params: new HttpParams().set('command', 'approve')
    });
  }

  reject(id: number, request: MembershipRejectRequest): Observable<MembershipApplication> {
    return this.http.post<MembershipApplication>(`/nepal/memberships/${id}`, request, {
      params: new HttpParams().set('command', 'reject')
    });
  }

  /** Whether the signed-in user holds one of these permissions, or all functions. */
  can(...permissions: string[]): boolean {
    const held: string[] = this.authenticationService.getCredentials()?.permissions ?? [];
    return [
      'ALL_FUNCTIONS',
      ...permissions
    ].some((p) => held.includes(p));
  }

  /**
   * Whether the signed-in user may decide this application: with "a different person must approve" on, not the
   * person who entered it (the server refuses that too).
   */
  mayDecide(application: MembershipApplication, settings: MembershipSettings | null | undefined): boolean {
    const me = this.authenticationService.getCredentials()?.userId;
    return !settings?.separateApprover || application.submittedById == null || application.submittedById !== me;
  }

  nominee(clientId: number): Observable<MemberNominee> {
    return this.http.get<MemberNominee>(`/nepal/memberships/nominees/${clientId}`);
  }

  /** Gives or changes the nominee (UPDATE_NOMINEE); the one before goes into the history. */
  changeNominee(clientId: number, nominee: Nominee, note?: string): Observable<MemberNominee> {
    return this.http.put<MemberNominee>(`/nepal/memberships/nominees/${clientId}`, { nominee, note });
  }

  membersWithoutShares(): Observable<MembersWithoutShares> {
    return this.http.get<MembersWithoutShares>('/nepal/memberships/members-without-shares');
  }

  settings(): Observable<MembershipSettingsView> {
    return this.http.get<MembershipSettingsView>('/nepal/memberships/settings');
  }

  updateSettings(settings: Partial<MembershipSettings>): Observable<MembershipSettingsView> {
    return this.http.put<MembershipSettingsView>('/nepal/memberships/settings', settings);
  }

  /** The organisation types in dropdown order, with whether each may be members; any signed-in user. */
  organisationCategories(): Observable<OrganisationCategory[]> {
    return this.http.get<OrganisationCategory[]>('/nepal/memberships/organisation-categories');
  }

  /** Switches a type on or off (UPDATE_MEMBERSHIPSETTINGS); answers the whole list. */
  updateOrganisationCategory(codeValueId: number, mayBeMember: boolean): Observable<OrganisationCategory[]> {
    return this.http.put<OrganisationCategory[]>(`/nepal/memberships/organisation-categories/${codeValueId}`, {
      mayBeMember
    });
  }

  /** The block shows its own failure and not-found states, so the global alert is off. */
  shares(clientId: number | string): Observable<MemberShares> {
    return this.http.get<MemberShares>(`/nepal/memberships/shares/${clientId}`, {
      context: new HttpContext().set(SILENT_ERRORS, true)
    });
  }

  shareCeiling(): Observable<ShareCeiling> {
    return this.http.get<ShareCeiling>('/nepal/memberships/share-ceiling');
  }

  exits(filter: { status?: ExitFilter; clientId?: number | string }): Observable<MembershipExit[]> {
    let params = new HttpParams();
    if (filter.status) params = params.set('status', filter.status);
    if (filter.clientId != null) params = params.set('clientId', String(filter.clientId));
    return this.http.get<MembershipExit[]>('/nepal/memberships/exits', { params });
  }

  requestExit(body: { clientId: number; requestedOn?: string; reason?: string }): Observable<MembershipExit> {
    return this.http.post<MembershipExit>('/nepal/memberships/exits', body);
  }

  /** settle (nothing owed any more), refund (pay the shares back) or cancel */
  exitCommand(id: number, command: 'settle' | 'refund' | 'cancel', body: object = {}): Observable<MembershipExit> {
    return this.http.post<MembershipExit>(`/nepal/memberships/exits/${id}`, body, {
      params: new HttpParams().set('command', command)
    });
  }
}
