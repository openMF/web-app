import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Accounting } from 'app/core/utils/accounting';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatDivider } from '@angular/material/divider';
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
import { GlAccountDisplayComponent } from '../../../../shared/accounting/gl-account-display/gl-account-display.component';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-share-product-general-tab',
  templateUrl: './share-product-general-tab.component.html',
  styleUrls: ['./share-product-general-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatDivider,
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
    GlAccountDisplayComponent,
    DateFormatPipe,
    FormatNumberPipe,
    YesnoPipe
  ]
})
export class ShareProductGeneralTabComponent {
  shareProduct: any;

  marketPriceDisplayedColumns: string[] = [
    'fromDate',
    'shareValue'
  ];
  chargesDisplayedColumns: string[] = [
    'name',
    'chargeCalculationType',
    'amount',
    'chargeTimeType'
  ];

  constructor(
    private route: ActivatedRoute,
    private accounting: Accounting
  ) {
    this.route.data.subscribe((data: { shareProduct: any }) => {
      this.shareProduct = data.shareProduct;
    });
  }

  getAccountingRuleName(value: string): string {
    return this.accounting.getAccountRuleName(value.toUpperCase());
  }
}
