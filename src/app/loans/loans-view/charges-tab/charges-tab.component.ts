/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatCheckbox } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { catchError, forkJoin, of } from 'rxjs';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';

/** Custom Dialogs */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { Dates } from 'app/core/utils/dates';
import { SystemService } from 'app/system/system.service';
import { GlobalConfiguration } from 'app/system/configurations/global-configurations-tab/configuration.model';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'app/core/alert/alert.service';
import { CurrencyPipe } from '@angular/common';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanCharge } from 'app/loans/models/loan-charge.model';
import { FormatNumberPipe } from '@pipes/format-number.pipe';
import { LoanAccountTabBaseComponent } from '../loan-account-tab-base.component';

@Component({
  selector: 'mifosx-charges-tab',
  templateUrl: './charges-tab.component.html',
  styleUrls: ['./charges-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    MatButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatCheckbox,
    CurrencyPipe,
    DateFormatPipe,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChargesTabComponent extends LoanAccountTabBaseComponent implements OnInit {
  private loansService = inject(LoansService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private dateUtils = inject(Dates);
  private translateService = inject(TranslateService);
  private dialog = inject(MatDialog);
  private settingsService = inject(SettingsService);
  private systemService = inject(SystemService);
  private alertService = inject(AlertService);

  loanDetails: any;
  chargesData: LoanCharge[] = [];
  status: any;
  groupHeaderColumns: string[] = [];
  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<any>;
  useDueDate = true;
  selection = new SelectionModel<LoanCharge>(true, []);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor() {
    super();
    this.route.parent.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanDetailsData: any }) => {
      this.loanDetails = data.loanDetailsData;
    });
    if (this.loanProductService.isWorkingCapital) {
      this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanChargeData: any }) => {
        this.loanDetails.charges = data.loanChargeData;
      });
    }
  }

  ngOnInit() {
    this.systemService.getConfigurationByName('charge-accrual-date').subscribe((config: GlobalConfiguration) => {
      this.useDueDate = config.stringValue === 'due-date';
    });
    this.chargesData = this.loanDetails.charges;
    this.status = this.loanDetails.status.value;
    let actionFlag: boolean;
    this.chargesData.forEach((element: any) => {
      element.dueDate = this.dateUtils.parseDate(element.dueDate);
      actionFlag =
        element.paid ||
        element.waived ||
        element.chargeTimeType.value === 'Disbursement' ||
        this.loanDetails.status.value !== 'Active';
      element.actionFlag = actionFlag;
    });
    this.chargesData = this.chargesData.sort((a: any, b: any) => b.dueDate - a.dueDate);
    this.buildColumns();
    this.dataSource = new MatTableDataSource(this.chargesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.selection.changed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cdr.detectChanges());
  }

  private buildColumns(): void {
    const hasMultiple = this.chargesData.length > 1;
    this.displayedColumns = [
      ...(hasMultiple ? ['select'] : []),
      'name',
      'feepenalty',
      'paymentdueat',
      'dueDate',
      'due',
      'paid',
      'waived',
      'outstanding',
      'actions'
    ];
    this.groupHeaderColumns = [
      ...(hasMultiple ? ['group-select'] : []),
      'group-info',
      'group-financial',
      'group-actions'
    ];
  }

  get waivableCharges(): LoanCharge[] {
    return this.chargesData.filter((c) => !c.actionFlag);
  }

  isAllSelected(): boolean {
    const waivable = this.waivableCharges;
    return waivable.length > 0 && waivable.every((c) => this.selection.isSelected(c));
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.waivableCharges.forEach((c) => this.selection.select(c));
    }
  }

  bulkWaiveSelected(): void {
    const count = this.selection.selected.length;
    const confirmRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Waive Charge'),
        dialogContext: this.translateService.instant('labels.dialogContext.Are you sure you want to waive charges', {
          count
        }),
        type: 'Basic'
      }
    });
    confirmRef.afterClosed().subscribe((response: any) => {
      if (response?.confirm) {
        const requests = this.selection.selected.map((charge) =>
          this.loansService
            .executeLoansAccountChargesCommand(
              this.loanProductService.loanAccountPath,
              this.loanDetails.id,
              'waive',
              {},
              charge.id
            )
            .pipe(catchError(() => of({ failed: true })))
        );
        forkJoin(requests).subscribe((results) => {
          this.selection.clear();
          this.reload();
          const failCount = results.filter((r: any) => r?.failed).length;
          if (failCount > 0) {
            this.alertService.alert({
              type: this.translateService.instant('errors.loans.bulkWaiveCharge.type'),
              message: this.translateService.instant('errors.loans.bulkWaiveCharge.message', { count: failCount })
            });
          }
        });
      }
    });
  }

  adjustCharge(chargeId: string) {
    this.router.navigate([`${chargeId}/adjustment`], {
      queryParams: { productType: this.loanProductService.productType.value },
      relativeTo: this.route
    });
  }

  payCharge(chargeId: any) {
    const formfields: FormfieldBase[] = [
      new DatepickerBase({
        controlName: 'transactionDate',
        label: 'Payment Date',
        value: '',
        type: 'date',
        required: true
      })
    ];
    const data = {
      title: `Pay Charge ${chargeId}`,
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const payChargeDialogRef = this.dialog.open(FormDialogComponent, { data });
    payChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const locale = this.settingsService.language.code;
        const dateFormat = this.settingsService.dateFormat;
        const dataObject = {
          transactionDate: this.dateUtils.formatDate(response.data.value.transactionDate, dateFormat),
          dateFormat,
          locale
        };
        this.loansService
          .executeLoansAccountChargesCommand(
            this.loanProductService.loanAccountPath,
            this.loanDetails.id,
            'pay',
            dataObject,
            chargeId
          )
          .subscribe(() => this.reload());
      }
    });
  }

  waiveCharge(chargeId: any) {
    const waiveChargeDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Waive Charge'),
        dialogContext:
          this.translateService.instant('labels.dialogContext.Are you sure you want to waive charge with id:') +
          `${chargeId} ?`,
        type: 'Basic'
      }
    });
    waiveChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.loansService
          .executeLoansAccountChargesCommand(
            this.loanProductService.loanAccountPath,
            this.loanDetails.id,
            'waive',
            {},
            chargeId
          )
          .subscribe(() => this.reload());
      }
    });
  }

  editCharge(charge: any) {
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'amount',
        label: 'Amount',
        value: this.isPercentageCharge(charge) ? charge.amountOrPercentage : charge.amount,
        type: 'number',
        required: true
      })
    ];
    const data = {
      title: `Edit Charge ${charge.id}`,
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const editChargeDialogRef = this.dialog.open(FormDialogComponent, { data });
    editChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const locale = this.settingsService.language.code;
        const dateFormat = this.settingsService.dateFormat;
        this.loansService
          .editLoansAccountCharge(
            this.loanProductService.loanAccountPath,
            this.loanDetails.id,
            { ...response.data.value, dateFormat, locale },
            charge.id
          )
          .subscribe(() => this.reload());
      }
    });
  }

  deleteCharge(chargeId: any) {
    const deleteChargeDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `charge id:${chargeId}` }
    });
    deleteChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.loansService
          .deleteLoansAccountCharge(this.loanProductService.loanAccountPath, this.loanDetails.id, chargeId)
          .subscribe(() => this.reload());
      }
    });
  }

  routeEdit($event: MouseEvent) {
    $event.stopPropagation();
  }

  isPercentageCharge(loanCharge: LoanCharge): boolean {
    return loanCharge.chargeCalculationType.code.includes('.percent.');
  }

  get totalDue(): number {
    return this.chargesData?.reduce((s, c) => s + (c.amount ?? 0), 0) ?? 0;
  }

  get totalPaid(): number {
    return this.chargesData?.reduce((s, c) => s + (c.amountPaid ?? 0), 0) ?? 0;
  }

  get totalWaived(): number {
    return this.chargesData?.reduce((s, c) => s + (c.amountWaived ?? 0), 0) ?? 0;
  }

  get totalOutstanding(): number {
    return this.chargesData?.reduce((s, c) => s + (c.amountOutstanding ?? 0), 0) ?? 0;
  }

  get currencyCode(): string {
    return this.chargesData?.[0]?.currency?.code || this.loanDetails?.currency?.code;
  }

  paidProgress(charge: LoanCharge): number {
    return charge.amount > 0 ? Math.round((charge.amountPaid / charge.amount) * 100) : 0;
  }

  isWaived(charge: LoanCharge): boolean {
    return charge.waived;
  }

  isPaid(charge: LoanCharge): boolean {
    return charge.paid;
  }

  rowStatus(charge: LoanCharge): string {
    if (this.isWaived(charge)) return 'row-state-waived';
    if (this.isPaid(charge)) return 'row-state-paid';
    if (charge.amountPaid > 0) return 'row-state-partial';
    return 'row-state-alert';
  }
}
