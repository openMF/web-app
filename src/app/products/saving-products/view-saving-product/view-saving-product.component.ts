import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-view-saving-product',
  templateUrl: './view-saving-product.component.html',
  styleUrls: ['./view-saving-product.component.scss']
})
export class ViewSavingProductComponent implements OnInit {

  savingProduct: any;

  chargesDisplayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType'];
  paymentFundSourceDisplayedColumns: string[] = ['paymentTypeId', 'fundSourceAccountId'];
  feesPenaltyIncomeDisplayedColumns: string[] = ['chargeId', 'incomeAccountId'];

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { savingProduct: any }) => {
      this.savingProduct = data.savingProduct;
    });
  }

  ngOnInit() {
  }

}
