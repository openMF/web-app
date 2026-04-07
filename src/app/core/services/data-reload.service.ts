/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';

/**
 * Service to handle component data reloading without navigation hacks.
 * Provides a clean way to trigger data refreshes across the application.
 * Uses ReplaySubject to handle late subscribers and race conditions.
 */
@Injectable({
  providedIn: 'root'
})
export class DataReloadService {
  private reloadSubjects = new Map<string, ReplaySubject<void>>();

  /**
   * Gets or creates a reload observable for a specific component/context.
   * @param context Unique identifier for the reload context (e.g., 'savings-account', 'loan-view')
   * @returns Observable that emits when a reload is triggered
   */
  getReloadObservable(context: string): Observable<void> {
    if (!this.reloadSubjects.has(context)) {
      this.reloadSubjects.set(context, new ReplaySubject<void>(1));
    }
    return this.reloadSubjects.get(context)!.asObservable();
  }

  /**
   * Triggers a reload for the specified context.
   * All components subscribed to this context will be notified.
   * Late subscribers will immediately receive the last reload notification.
   * @param context Unique identifier for the reload context
   */
  triggerReload(context: string): void {
    if (!this.reloadSubjects.has(context)) {
      this.reloadSubjects.set(context, new ReplaySubject<void>(1));
    }
    this.reloadSubjects.get(context)!.next();
  }

  /**
   * Cleanup method to remove subjects when they're no longer needed.
   * @param context Unique identifier for the reload context
   */
  cleanup(context: string): void {
    if (this.reloadSubjects.has(context)) {
      this.reloadSubjects.get(context)!.complete();
      this.reloadSubjects.delete(context);
    }
  }
}
