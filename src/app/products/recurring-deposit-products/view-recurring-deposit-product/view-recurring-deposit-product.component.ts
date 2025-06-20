import { Component } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-recurring-deposit-product',
  templateUrl: './view-recurring-deposit-product.component.html',
  styleUrls: ['./view-recurring-deposit-product.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet
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
