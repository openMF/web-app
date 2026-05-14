/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject
} from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { GLAccount } from 'app/shared/models/general.model';
import { ReplaySubject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'mifosx-gl-account-selector',
  templateUrl: './gl-account-selector.component.html',
  styleUrls: ['./gl-account-selector.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NgxMatSelectSearchModule,
    MatIconButton,
    FaIconComponent,
    AsyncPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlAccountSelectorComponent implements OnInit, OnChanges {
  private translateService = inject(TranslateService);

  @Input() inputFormControl: UntypedFormControl;
  @Input() glAccountList: GLAccount[] = [];
  @Input() required = false;
  @Input() inputLabel = '';

  /** GL Account data. */
  protected glAccountData: ReplaySubject<GLAccount[]> = new ReplaySubject<GLAccount[]>(1);

  /** control for the filter select */
  protected filterFormCtrl: UntypedFormControl = new UntypedFormControl('');

  private destroyRef = inject(DestroyRef);

  placeHolderLabel = '';
  noEntriesFoundLabel = '';

  ngOnInit(): void {
    // listen for search field value changes
    this.filterFormCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.searchGLAccount();
    });

    this.placeHolderLabel = this.translateService.instant('labels.text.Search');
    this.noEntriesFoundLabel = this.translateService.instant('labels.text.No data found');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.glAccountList) {
      this.glAccountData.next(this.glAccountList.slice());
    }
  }

  searchGLAccount(): void {
    if (this.glAccountList) {
      const search: string = this.filterFormCtrl.value.toLowerCase();

      if (!search) {
        this.glAccountData.next(this.glAccountList.slice());
      } else {
        this.glAccountData.next(
          this.glAccountList.filter((option: GLAccount) => {
            return option.name.toLowerCase().indexOf(search) >= 0 || option.glCode.toLowerCase().indexOf(search) >= 0;
          })
        );
      }
    }
  }

  resetValue($event: Event): void {
    $event.stopPropagation();
    this.inputFormControl.setValue(null);
    this.inputFormControl.markAsDirty();
    this.inputFormControl.markAsTouched();
    this.inputFormControl.updateValueAndValidity();
  }
}
