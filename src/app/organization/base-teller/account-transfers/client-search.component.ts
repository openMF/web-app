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
  EventEmitter,
  Input,
  Output,
  OnDestroy
} from '@angular/core';
import { inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject, finalize, takeUntil } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MatProgressBar } from '@angular/material/progress-bar';
import { AccountTransferService } from './account-transfer.service';
import { TransferClient } from './account-transfer.models';
import { transferError } from './account-transfer-error';

@Component({ selector: 'mifosx-transfer-client-search', changeDetection: ChangeDetectionStrategy.OnPush, imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressBar
  ], templateUrl: './client-search.component.html' })
export class TransferClientSearchComponent implements OnDestroy {
  @Input() method: 'clientNumber' | 'name' | null = null;
  @Output() selected = new EventEmitter<TransferClient>();
  form;
  clients: TransferClient[] = [];
  total = 0;
  offset = 0;
  loading = false;
  searched = false;
  error = '';
  private cancel = new Subject<void>();
  private api = inject(AccountTransferService);
  private cdr = inject(ChangeDetectorRef);
  constructor() {
    const fb = inject(FormBuilder);
    this.form = fb.nonNullable.group({ method: ['clientNumber' as 'clientNumber' | 'name'], query: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ] });
    this.form.valueChanges.subscribe(() => this.clear());
  }
  clear() {
    this.cancel.next();
    this.clients = [];
    this.total = 0;
    this.searched = false;
    this.error = '';
  }
  search(offset = 0) {
    if (this.form.invalid || !this.form.controls.query.value.trim()) return;
    this.clear();
    this.offset = offset;
    this.loading = true;
    this.api
      .clients(this.method ?? this.form.controls.method.value, this.form.controls.query.value, offset)
      .pipe(
        takeUntil(this.cancel),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (page) => {
          this.clients = page.pageItems;
          this.total = page.totalFilteredRecords;
          this.searched = true;
        },
        error: (e) => (this.error = transferError(e))
      });
  }
  choose(client: TransferClient) {
    this.selected.emit(client);
  }
  ngOnDestroy() {
    this.cancel.next();
    this.cancel.complete();
  }
}
