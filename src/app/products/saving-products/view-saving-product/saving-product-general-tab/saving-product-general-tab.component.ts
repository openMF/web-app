import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Accounting } from 'app/core/utils/accounting';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatDivider } from '@angular/material/divider';
import { NgIf } from '@angular/common';
import {
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
import { ViewSavingsAccountingDetailsComponent } from '../../../../shared/accounting/view-savings-accounting-details/view-savings-accounting-details.component';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../../pipes/yesno.pipe';

@Component({
  selector: 'mifosx-saving-product-general-tab',
  templateUrl: './saving-product-general-tab.component.html',
  styleUrls: ['./saving-product-general-tab.component.scss'],
  imports: [
    HasPermissionDirective,
    MatButton,
    RouterLink,
    FaIconComponent,
    MatDivider,
    NgIf,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    ViewSavingsAccountingDetailsComponent,
    TranslatePipe,
    FormatNumberPipe,
    YesnoPipe,
    NgxTranslatePipe
  ]
})
export class SavingProductGeneralTabComponent {
  savingProduct: any;

  chargesDisplayedColumns: string[] = [
    'name',
    'chargeCalculationType',
    'amount',
    'chargeTimeType'
  ];
  paymentFundSourceDisplayedColumns: string[] = [
    'paymentTypeId',
    'fundSourceAccountId'
  ];
  feesPenaltyIncomeDisplayedColumns: string[] = [
    'chargeId',
    'incomeAccountId'
  ];

  constructor(
    private route: ActivatedRoute,
    private accounting: Accounting
  ) {
    this.route.data.subscribe((data: { savingProduct: any }) => {
      this.savingProduct = data.savingProduct;
    });
  }

  isCashOrAccrualAccounting(): boolean {
    return this.accounting.isCashOrAccrualAccounting(this.savingProduct.accountingRule);
  }

  isAccrualAccounting(): boolean {
    return this.accounting.isAccrualAccounting(this.savingProduct.accountingRule);
  }
}
