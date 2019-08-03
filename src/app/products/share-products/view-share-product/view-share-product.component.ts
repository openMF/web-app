import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-view-share-product',
  templateUrl: './view-share-product.component.html',
  styleUrls: ['./view-share-product.component.scss']
})
export class ViewShareProductComponent implements OnInit {

  shareProduct: any;

  marketPriceDisplayedColumns: string[] = ['fromDate', 'shareValue'];
  chargesDisplayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType'];

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { shareProduct: any }) => {
      this.shareProduct = data.shareProduct;
    });
  }

  ngOnInit() {
  }

}
