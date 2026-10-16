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
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Subject, Observable, finalize, takeUntil } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AccountTransferService } from './account-transfer.service';
import {
  TransferAccount,
  TransferClient,
  TransferContext,
  TransferOperation,
  TransferPreview,
  TransferReceipt,
  TransferRequest
} from './account-transfer.models';
import { TransferClientSearchComponent } from './client-search.component';
import { TransferAccountDetailsComponent } from './account-details.component';
import { TransferSummaryComponent } from './transfer-summary.component';
import { transferError } from './account-transfer-error';

export function validTransferAmount(value: string, decimalPlaces: number): boolean {
  return (
    /^(?:0|[1-9]\d{0,12})(?:\.\d{1,6})?$/.test(value) &&
    /[1-9]/.test(value) &&
    (value.split('.')[1]?.length ?? 0) <= Math.min(decimalPlaces, 6)
  );
}
@Component({
  selector: 'mifosx-account-transfers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-transfers.component.html',
  styleUrls: ['./account-transfers.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressBar,
    TransferClientSearchComponent,
    TransferAccountDetailsComponent,
    TransferSummaryComponent
  ]
})
export class AccountTransfersComponent implements OnInit, OnDestroy {
  @ViewChild('stageHeading') stageHeading?: ElementRef<HTMLElement>;
  context: TransferContext | null = null;
  client: TransferClient | null = null;
  beneficiary: TransferClient | null = null;
  sources: TransferAccount[] = [];
  targets: TransferAccount[] = [];
  source: TransferAccount | null = null;
  target: TransferAccount | null = null;
  preview: TransferPreview | null = null;
  receipt: TransferReceipt | null = null;
  printedReceipt: TransferReceipt | null = null;
  historicalReceipt = false;
  busy = '';
  error = '';
  uncertain = false;
  form;
  lookup;
  receiptReference;
  private cancel = new Subject<void>();
  private pending: TransferRequest | null = null;
  private api = inject(AccountTransferService);
  private cdr = inject(ChangeDetectorRef);
  constructor() {
    const fb = inject(FormBuilder);
    this.form = fb.nonNullable.group({ operation: [
        '' as TransferOperation | '',
        Validators.required
      ], source: [
        '',
        Validators.required
      ], target: [
        '',
        Validators.required
      ], method: ['accountNumber'], amount: [
        '',
        [
          Validators.required,
          (control: AbstractControl): ValidationErrors | null =>
            validTransferAmount(String(control.value), this.source?.decimalPlaces ?? 6) ? null : { amount: true }
        ]
      ] });
    this.receiptReference = fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^[1-9]\d{0,14}$/)
    ]);
    this.lookup = fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(100)
    ]);
  }
  ngOnInit() {
    this.loadContext();
  }
  get canCreate() {
    return !!this.context?.permissions.includes('CREATE_ACCOUNTTRANSFER');
  }
  private request<T>(busy: string, observable: Observable<T>, next: (value: T) => void) {
    this.error = '';
    this.busy = busy;
    this.form.disable({ emitEvent: false });
    observable
      .pipe(
        takeUntil(this.cancel),
        finalize(() => {
          this.busy = '';
          this.form.enable({ emitEvent: false });
          this.cdr.markForCheck();
        })
      )
      .subscribe({ next, error: (e) => (this.error = transferError(e)) });
  }
  private invalidate() {
    this.cancel.next();
    this.preview = null;
    this.pending = null;
    this.error = '';
  }
  private clearTarget() {
    this.target = null;
    this.beneficiary = null;
    this.targets = [];
    this.form.controls.target.setValue('');
    this.lookup.reset();
  }
  loadContext() {
    this.request('context', this.api.context(), (context) => (this.context = context));
  }
  selectClient(client: TransferClient) {
    this.invalidate();
    this.client = client;
    this.source = null;
    this.sources = [];
    this.clearTarget();
    this.form.reset();
    this.request(
      'sources',
      this.api.sources(client.clientId),
      (accounts) => (this.sources = accounts.filter((a) => a.canDebit))
    );
  }
  changeClient() {
    this.invalidate();
    this.client = null;
    this.source = null;
    this.sources = [];
    this.clearTarget();
    this.form.reset();
  }
  changeOperation() {
    this.invalidate();
    this.clearTarget();
    this.form.controls.method.setValue('accountNumber');
    if (this.source && this.form.controls.operation.value === 'BETWEEN_MY_ACCOUNTS') this.loadTargets();
  }
  changeSource() {
    this.invalidate();
    this.clearTarget();
    this.source = this.sources.find((a) => this.accountKey(a) === this.form.controls.source.value) ?? null;
    this.form.controls.amount.updateValueAndValidity();
    if (this.source && this.form.controls.operation.value === 'BETWEEN_MY_ACCOUNTS') this.loadTargets();
  }
  changeMethod() {
    this.invalidate();
    this.clearTarget();
  }
  selectBeneficiary(client: TransferClient) {
    this.invalidate();
    this.clearTarget();
    this.beneficiary = client;
    this.loadTargets(client.clientId);
  }
  private loadTargets(beneficiaryClientId?: number) {
    this.request(
      'targets',
      this.api.destinations(
        this.client!.clientId,
        this.source!.accountId,
        this.form.controls.operation.value as TransferOperation,
        beneficiaryClientId
      ),
      (accounts) => (this.targets = accounts.filter((a) => a.canCredit && !this.sameAccount(a)))
    );
  }
  lookupEdited() {
    this.invalidate();
    this.target = null;
    this.targets = [];
    this.beneficiary = null;
    this.form.controls.target.reset();
  }
  retrieveReceipt() {
    if (this.busy || this.receiptReference.invalid) return;
    this.request('receipt', this.api.retrieve(Number(this.receiptReference.value)), (receipt) => {
      this.historicalReceipt = true;
      this.receipt = receipt;
      this.focusStage();
    });
  }
  lookupAccount() {
    if (this.lookup.invalid || !this.lookup.value.trim() || this.busy) return;
    this.invalidate();
    this.target = null;
    this.targets = [];
    this.beneficiary = null;
    this.form.controls.target.reset();
    this.request(
      'lookup',
      this.api.lookup(this.lookup.value, this.client!.clientId, this.source!.accountId, 'TO_THIRD_PARTY'),
      (account) => {
        if (!account.canCredit || this.sameAccount(account)) {
          this.error = 'accountTransfer.ineligible';
          return;
        }
        this.targets = [account];
        this.beneficiary = account.owner;
        this.form.controls.target.setValue(this.accountKey(account));
        this.selectTarget();
      }
    );
  }
  accountKey(account: TransferAccount) {
    return account.accountType + ':' + account.accountId;
  }
  sameAccount(account: TransferAccount) {
    return !!this.source && this.accountKey(account) === this.accountKey(this.source);
  }
  selectTarget() {
    this.invalidate();
    this.target = this.targets.find((a) => this.accountKey(a) === this.form.controls.target.value) ?? null;
  }
  amountChanged() {
    this.invalidate();
  }
  showPreview() {
    this.form.markAllAsTouched();
    if (
      this.busy ||
      this.form.invalid ||
      !this.source ||
      !this.target ||
      !this.client ||
      this.sameAccount(this.target) ||
      !this.canCreate
    )
      return;
    const request: TransferRequest = {
      operationType: this.form.controls.operation.value as TransferOperation,
      orderingClientId: this.client.clientId,
      sourceAccountId: this.source.accountId,
      targetAccountType: this.target.accountType,
      targetAccountId: this.target.accountId,
      amount: this.form.controls.amount.value
    };
    this.request('preview', this.api.preview(request), (preview) => {
      this.preview = preview;
      this.pending = {
        ...request,
        idempotencyKey: Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
          byte.toString(16).padStart(2, '0')
        ).join('')
      };
      this.focusStage();
    });
  }
  confirm() {
    if (this.busy || !this.pending || !this.preview?.balanced || !this.canCreate || this.receipt) return;
    this.busy = 'submit';
    this.error = '';
    this.api
      .create(this.pending)
      .pipe(
        takeUntil(this.cancel),
        finalize(() => {
          this.busy = '';
          this.form.enable({ emitEvent: false });
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (receipt) => {
          this.receipt = receipt;
          this.preview = null;
          this.uncertain = false;
          this.pending = null;
          this.focusStage();
        },
        error: (e) => {
          this.error = transferError(e);
          // A failed retry cannot resolve an earlier ambiguous outcome; only a receipt can.
          this.uncertain ||= e.status === 0 || e.status >= 500;
          if (this.uncertain) this.error = 'accountTransfer.uncertain';
        }
      });
  }
  back() {
    if (!this.busy && !this.uncertain) {
      this.preview = null;
      this.pending = null;
      this.error = '';
      this.focusStage();
    }
  }
  reset() {
    if (this.busy || this.uncertain) return;
    this.changeClient();
    this.receipt = null;
    this.historicalReceipt = false;
    this.printedReceipt = null;
    this.focusStage();
  }
  printReceipt() {
    if (this.busy || !this.receipt) return;
    this.request('receipt', this.api.receipt(this.receipt.transferId), (receipt) => {
      this.printedReceipt = receipt;
      this.cdr.detectChanges();
      // Allow the backend receipt to render before opening the browser's print dialog.
      setTimeout(() => window.print());
    });
  }
  private focusStage() {
    setTimeout(() => this.stageHeading?.nativeElement.focus());
  }
  ngOnDestroy() {
    this.cancel.next();
    this.cancel.complete();
    this.pending = null;
    this.client = null;
    this.beneficiary = null;
    this.sources = [];
    this.targets = [];
  }
}
