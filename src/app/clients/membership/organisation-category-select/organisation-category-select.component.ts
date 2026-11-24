/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnInit,
  Pipe,
  PipeTransform,
  computed,
  effect,
  inject,
  input,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MembershipService } from '../membership.service';
import { OrganisationCategory, organisationCategoryLabel } from '../membership.models';

/**
 * The organisation type dropdown (Fineract's Constitution, fineract-dbug #127): the types in the user's language, and
 * while {@link enforce} is on, those that may not be members greyed out with a hint, kept visible so the clerk sees
 * why. The type saved on the client ({@link current}) stays selectable even when refused today, and is shown from the
 * client data when it is no longer in the list.
 */
@Component({
  selector: 'mifosx-organisation-category-select',
  template: `
    <mat-form-field>
      <mat-label>{{ 'labels.inputs.Constitution' | translate }}</mat-label>
      <mat-select [formControl]="control" required>
        @for (o of shown(); track o.codeValueId) {
          <mat-option [value]="o.codeValueId" [disabled]="refused(o.codeValueId)">
            {{ labelOf(o) }}
            @if (refused(o.codeValueId)) {
              <span class="tag">({{ 'organisationCategories.notMember' | translate }})</span>
            }
          </mat-option>
        }
      </mat-select>
      @if (state() === 'loading') {
        <mat-hint>{{ 'organisationCategories.loading' | translate }}</mat-hint>
      } @else if (state() === 'failed') {
        <mat-hint class="failed" role="alert"
          >{{ 'organisationCategories.failed' | translate }}
          <button mat-button color="primary" type="button" (click)="load()">
            {{ 'labels.buttons.Retry' | translate }}
          </button></mat-hint
        >
      } @else if (enforce() && hasRefused()) {
        <mat-hint>{{ 'organisationCategories.greyedHint' | translate }}</mat-hint>
      }
      @if (control.hasError('required')) {
        <mat-error>
          {{ 'labels.inputs.Constitution' | translate }} {{ 'labels.commons.is' | translate }}
          <strong>{{ 'labels.commons.required' | translate }}</strong>
        </mat-error>
      } @else if (control.hasError('refused')) {
        <mat-error>{{ 'organisationCategories.cannotBeMember' | translate }}</mat-error>
      }
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      mat-form-field {
        flex: 1 1 240px;
        min-width: 0;
      }
      .tag {
        font-size: 0.85em;
      }
      .failed {
        color: var(--mat-sys-error, #b3261e);
      }
    `
  ],
  imports: [...STANDALONE_SHARED_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganisationCategorySelectComponent implements OnInit {
  private membershipService = inject(MembershipService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) control!: FormControl;
  /** The client is being made a member, or already is one: refused types cannot be chosen */
  readonly enforce = input(false);
  /** The type saved on the client being edited */
  readonly current = input<{ id: number; name: string } | null | undefined>(null);

  readonly options = signal<OrganisationCategory[]>([]);
  readonly state = signal<'loading' | 'failed' | 'loaded'>('loading');

  /** The list, plus the saved type when it is not in it (switched off under Manage Codes). */
  readonly shown = computed(() => {
    const list = this.options();
    const c = this.current();
    return c?.id != null && !list.some((o) => o.codeValueId === c.id) ? [
          ...list,
          { codeValueId: c.id, name: c.name, mayBeMember: true }
        ] : list;
  });
  readonly hasRefused = computed(() => this.shown().some((o) => this.refused(o.codeValueId)));

  private readonly refusedValidator = (c: AbstractControl): ValidationErrors | null =>
    this.refused(c.value) ? { refused: true } : null;

  constructor() {
    // a change of the rule or the list may make the chosen type refused, or no longer refused; after this check, as the
    // stepper above has already read the step's validity
    effect(() => {
      this.enforce();
      this.options();
      queueMicrotask(() => {
        this.control.updateValueAndValidity();
        if (this.control.hasError('refused')) {
          this.control.markAsTouched();
        }
        this.cdr.markForCheck();
      });
    });
  }

  ngOnInit(): void {
    this.control.addValidators(this.refusedValidator);
    this.destroyRef.onDestroy(() => this.control.removeValidators(this.refusedValidator));
    this.control.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cdr.markForCheck());
    this.load();
  }

  load(): void {
    this.state.set('loading');
    this.membershipService
      .organisationCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.options.set(list);
          this.state.set('loaded');
        },
        error: () => this.state.set('failed')
      });
  }

  /** Not selectable: the rule applies, the type may not be members, and it is not the one already saved. */
  refused(id: number | null | undefined): boolean {
    return (
      this.enforce() &&
      id != null &&
      id !== this.current()?.id &&
      this.options().some((o) => o.codeValueId === id && !o.mayBeMember)
    );
  }

  labelOf(o: OrganisationCategory): string {
    return organisationCategoryLabel(this.translate, o);
  }
}

/**
 * A client's organisation type in the user's language: `id | organisationCategoryName: name | async`, the name from the
 * client data shown meanwhile and whenever the type is not in the list.
 */
@Pipe({ name: 'organisationCategoryName' })
export class OrganisationCategoryNamePipe implements PipeTransform {
  private membershipService = inject(MembershipService);
  private translate = inject(TranslateService);

  transform(id: number | null | undefined, name: string | null | undefined): Observable<string> {
    const fallback = name ?? '';
    if (id == null) {
      return of(fallback);
    }
    return this.membershipService.organisationCategories().pipe(
      map((list) => {
        const category = list.find((o) => o.codeValueId === id);
        return category ? organisationCategoryLabel(this.translate, category) : fallback;
      }),
      catchError(() => of(fallback)),
      startWith(fallback)
    );
  }
}
