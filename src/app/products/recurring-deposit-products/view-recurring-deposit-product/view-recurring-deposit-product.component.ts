import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-view-recurring-deposit-product',
  templateUrl: './view-recurring-deposit-product.component.html',
  styleUrls: ['./view-recurring-deposit-product.component.scss']
})
export class ViewRecurringDepositProductComponent implements OnInit {

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

  ngOnInit() {
  }

}
