/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Fixed Deposit Product component.
 */
@Component({
  selector: 'mifosx-view-fixed-deposit-product',
  templateUrl: './view-fixed-deposit-product.component.html',
  styleUrls: ['./view-fixed-deposit-product.component.scss']
})

export class ViewFixedDepositProductComponent implements OnInit {

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

  ngOnInit() {
  }

}
