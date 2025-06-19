/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { NgFor } from '@angular/common';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Fixed Deposit Product component.
 */
@Component({
  selector: 'mifosx-view-fixed-deposit-product',
  templateUrl: './view-fixed-deposit-product.component.html',
  styleUrls: ['./view-fixed-deposit-product.component.scss'],
  imports: [
    MatCard,
    MatCardContent,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    RouterLink,
    NgFor,
    HasPermissionDirective,
    MatTabNavPanel,
    RouterOutlet,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class ViewFixedDepositProductComponent {
  fixedDepositDatatables: any = [];

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { fixedDepositDatatables: any }) => {
      this.fixedDepositDatatables = [];
      data.fixedDepositDatatables.forEach((datatable: any) => {
        if (datatable.entitySubType === 'Fixed Deposit') {
          this.fixedDepositDatatables.push(datatable);
        }
      });
    });
  }
}
