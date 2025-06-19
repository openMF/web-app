import { Component } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { NgFor } from '@angular/common';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'mifosx-view-recurring-deposit-product',
  templateUrl: './view-recurring-deposit-product.component.html',
  styleUrls: ['./view-recurring-deposit-product.component.scss'],
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
    NgxTranslatePipe
  ]
})
export class ViewRecurringDepositProductComponent {
  recurringDepositDatatables: any = [];

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { recurringDepositDatatables: any }) => {
      this.recurringDepositDatatables = [];
      data.recurringDepositDatatables.forEach((datatable: any) => {
        if (datatable.entitySubType === 'Recurring Deposit') {
          this.recurringDepositDatatables.push(datatable);
        }
      });
    });
  }
}
