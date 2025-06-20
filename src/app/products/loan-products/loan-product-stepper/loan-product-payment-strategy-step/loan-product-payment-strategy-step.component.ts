import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {
  AdvancedCreditAllocation,
  AdvancedPaymentAllocation,
  AdvancedPaymentStrategy,
  CreditAllocation,
  CreditAllocationOrder,
  PaymentAllocation,
  PaymentAllocationOrder,
  PaymentAllocationTransactionType
} from './payment-allocation-model';
import { MatDialog } from '@angular/material/dialog';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { MatTabGroup, MatTab, MatTabLabel, MatTabContent } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { AdvancePaymentAllocationTabComponent } from './advance-payment-allocation-tab/advance-payment-allocation-tab.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-product-payment-strategy-step',
  templateUrl: './loan-product-payment-strategy-step.component.html',
  styleUrls: ['./loan-product-payment-strategy-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTabGroup,
    MatTab,
    MatTabLabel,
    AdvancePaymentAllocationTabComponent,
    MatIconButton,
    MatIcon,
    FaIconComponent,
    MatTabContent
  ]
})
export class LoanProductPaymentStrategyStepComponent implements OnInit {
  @Input() advancedPaymentAllocations: AdvancedPaymentAllocation[] = [];
  @Input() advancedCreditAllocations: AdvancedCreditAllocation[] = [];
  @Input() advancedPaymentAllocationTransactionTypes: PaymentAllocationTransactionType[] = [];
  @Input() paymentAllocationOrderDefault: PaymentAllocationOrder[];
  @Input() advancedCreditAllocationTransactionTypes: PaymentAllocationTransactionType[] = [];
  @Input() creditAllocationOrderDefault: CreditAllocationOrder[];

  @Output() paymentAllocationChange = new EventEmitter<boolean>();
  @Output() setPaymentAllocation = new EventEmitter<PaymentAllocation[]>();
  @Output() setCreditAllocation = new EventEmitter<CreditAllocation[]>();

  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

  constructor(
    private dialog: MatDialog,
    private advancedPaymentStrategy: AdvancedPaymentStrategy,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.sendAllocations();
  }

  sendAllocations(): void {
    this.setPaymentAllocation.emit(
      this.advancedPaymentStrategy.buildPaymentAllocations(this.advancedPaymentAllocations)
    );
    this.setCreditAllocation.emit(this.advancedPaymentStrategy.buildCreditAllocations(this.advancedCreditAllocations));
  }

  allocationChanged(changed: boolean): void {
    this.paymentAllocationChange.emit(changed);
    this.sendAllocations();
  }

  addTransaction(): void {
    const transactionTypesCurrent: String[] = [];
    this.advancedPaymentAllocations.forEach((item: AdvancedPaymentAllocation) => {
      transactionTypesCurrent.push(item.transaction.code);
    });
    this.advancedCreditAllocations.forEach((item: AdvancedPaymentAllocation) => {
      transactionTypesCurrent.push(item.transaction.code);
    });

    const transactionTypesOptions: PaymentAllocationTransactionType[] = [];
    this.advancedPaymentAllocationTransactionTypes.forEach((option: PaymentAllocationTransactionType) => {
      if (!this.advancedPaymentStrategy.isDefault(option) && transactionTypesCurrent.indexOf(option.code) < 0) {
        option.credit = false;
        option.value = this.translateService.instant('labels.catalogs.' + option.value);
        transactionTypesOptions.push(option);
      }
    });
    this.advancedCreditAllocationTransactionTypes.forEach((option: PaymentAllocationTransactionType) => {
      if (transactionTypesCurrent.indexOf(option.code) < 0) {
        option.credit = true;
        option.value = this.translateService.instant('labels.catalogs.' + option.value);
        transactionTypesOptions.push(option);
      }
    });

    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'code',
        label: this.translateService.instant('labels.inputs.Transaction Type'),
        options: { label: 'value', value: 'code', data: transactionTypesOptions },
        order: 1
      })

    ];
    const data = {
      title: this.translateService.instant('labels.inputs.Advanced Payment Allocation Transaction Type'),
      layout: {
        addButtonText: this.translateService.instant('labels.buttons.Add'),
        cancelButtonText: this.translateService.instant('labels.buttons.Cancel')
      },
      formfields: formfields
    };
    const transactionTypeDialogRef = this.dialog.open(FormDialogComponent, { data });
    transactionTypeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const defaultPaymentAllocation: AdvancedPaymentAllocation = this.advancedPaymentAllocations[0];
        transactionTypesOptions.forEach((transactionType: PaymentAllocationTransactionType) => {
          if (transactionType.code === response.data.value.code) {
            if (!transactionType.credit) {
              this.advancedPaymentAllocations.push(
                this.advancedPaymentStrategy.buildAdvancedPaymentAllocation(
                  true,
                  transactionType,
                  this.paymentAllocationOrderDefault,
                  defaultPaymentAllocation.futureInstallmentAllocationRules
                )
              );
            } else {
              this.advancedCreditAllocations.push(
                this.advancedPaymentStrategy.buildAdvancedCreditAllocation(
                  transactionType,
                  this.creditAllocationOrderDefault
                )
              );
            }
            this.paymentAllocationChange.emit(true);
            this.sendAllocations();
          }
        });
      }
    });
  }

  transactionTypeRemoved(transaction: PaymentAllocationTransactionType): void {
    if (!transaction.credit) {
      this.advancedPaymentAllocations.forEach((item: AdvancedPaymentAllocation, index: number) => {
        if (item.transaction.code === transaction.code) {
          this.advancedPaymentAllocations.splice(index, 1);
          this.paymentAllocationChange.emit(true);
          this.tabGroup.selectedIndex = index - 1;
          this.sendAllocations();
        }
      });
    } else {
      this.advancedCreditAllocations.forEach((item: AdvancedPaymentAllocation, index: number) => {
        if (item.transaction.code === transaction.code) {
          this.advancedCreditAllocations.splice(index, 1);
          this.paymentAllocationChange.emit(true);
          this.tabGroup.selectedIndex = index - 1;
          this.sendAllocations();
        }
      });
    }
  }
}
