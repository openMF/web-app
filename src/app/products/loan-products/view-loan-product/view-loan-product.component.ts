import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-view-loan-product',
  templateUrl: './view-loan-product.component.html',
  styleUrls: ['./view-loan-product.component.scss']
})
export class ViewLoanProductComponent implements OnInit {

  loanProductDatatables: any = [];

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { loanProductDatatables: any }) => {
      this.loanProductDatatables = data.loanProductDatatables;
    });
  }

  ngOnInit() {
  }

}
