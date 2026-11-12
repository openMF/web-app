/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Directive, DestroyRef, Input, OnChanges, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { decimal } from 'app/products/saving-products/product-editor/interest-rate.model';

export interface Resource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  more?: boolean;
}
export const resource = <T>() => signal<Resource<T>>({ data: null, loading: false, error: null });
export function positiveId(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}
export function positiveAmount(value: unknown, digits: number): value is string {
  return (
    Number.isInteger(digits) && digits >= 0 && digits <= 6 && decimal(value, digits, false, true) && /[1-9]/.test(value)
  );
}
export function validName(value: string, maximum = 100): boolean {
  return !!value && value === value.trim() && value.length <= maximum && !/[\u0000-\u001f\u007f-\u009f]/.test(value);
}
export function errorKey(error: unknown, template = false): string {
  let body = error instanceof HttpErrorResponse ? error.error : null;
  if (typeof body === 'string' && body.length <= 65536) {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  const code = body?.reasonCode || body?.userMessageGlobalisationCode;
  if ([
      'REQUEST_CONFLICT',
      'error.msg.savings.main.account.conflict'
    ].includes(code)) return 'AccountManagement.Conflict';
  if (code === 'BLOCKED_PENDING_POLICY') return 'AccountManagement.PolicyRejected';
  const status = error instanceof HttpErrorResponse ? error.status : -1;
  if (status === 404) return template ? 'AccountManagement.EndpointUnavailable' : 'AccountManagement.ResourceMissing';
  const names: Record<number, string> = {
    0: 'NetworkUnknown',
    400: 'InvalidRequest',
    401: 'AuthenticationRequired',
    403: 'Forbidden',
    409: 'Conflict',
    422: 'PolicyRejected',
    429: 'RateLimited'
  };
  return 'AccountManagement.' + (names[status] || 'BackendError');
}
/** Cancel all prior customer reads, dialogs and subscriptions before resetting a section. No caching. */
@Directive()
export abstract class ClientSection implements OnChanges {
  @Input({ required: true }) clientId: number;
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly changed$ = new Subject<void>();
  private readonly dialogs = new Set<{ close(): void }>();
  constructor() {
    this.destroyRef.onDestroy(() => this.closeDialogs());
  }
  protected trackDialog<T extends { close(): void; afterClosed(): Observable<unknown> }>(ref: T): T {
    this.dialogs.add(ref);
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.dialogs.delete(ref));
    return ref;
  }
  private closeDialogs(): void {
    this.dialogs.forEach((ref) => ref.close());
    this.dialogs.clear();
  }
  ngOnChanges(): void {
    this.closeDialogs();
    this.changed$.next();
    this.reset();
  }
  protected abstract reset(): void;
  protected scoped<T>(source: Observable<T>): Observable<T> {
    return source.pipe(takeUntil(this.changed$), takeUntilDestroyed(this.destroyRef));
  }
  protected read<T>(target: WritableSignal<Resource<T>>, source: Observable<T>, template = false): void {
    target.set({ data: null, loading: true, error: null });
    this.scoped(source).subscribe({
      next: (data) => target.set({ data, loading: false, error: null }),
      error: (error) => target.set({ data: null, loading: false, error: errorKey(error, template) })
    });
  }
  protected page<T>(target: WritableSignal<Resource<T[]>>, source: Observable<T[]>, size = 25): void {
    if (target().loading) return;
    target.update((state) => ({ ...state, loading: true, error: null }));
    this.scoped(source).subscribe({
      next: (data) =>
        target.update((state) => ({ data: [
            ...(state.data || []),
            ...data
          ], loading: false, error: null, more: data.length === size })),
      error: (error) => target.update((state) => ({ ...state, loading: false, error: errorKey(error) }))
    });
  }
}
