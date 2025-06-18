import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Accounting } from 'app/core/utils/accounting';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCard, MatCardContent } from '@angular/material/card';
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
import { GlAccountDisplayComponent } from '../../../../shared/accounting/gl-account-display/gl-account-display.component';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { YesnoPipe } from '../../../../pipes/yesno.pipe';

@Component({
  selector: 'mifosx-share-product-general-tab',
  templateUrl: './share-product-general-tab.component.html',
  styleUrls: ['./share-product-general-tab.component.scss'],
  imports: [
    HasPermissionDirective,
    MatButton,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardContent,
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
    GlAccountDisplayComponent,
    TranslatePipe,
    DateFormatPipe,
    FormatNumberPipe,
    YesnoPipe,
    NgxTranslatePipe
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
