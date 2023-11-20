import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoanProduct } from '../../models/loan-product.model';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss']
})
export class GeneralTabComponent implements OnInit {

  loanProduct: LoanProduct;
  useDueForRepaymentsConfigurations = false;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { loanProduct: any }) => {
      this.loanProduct = data.loanProduct;
      this.useDueForRepaymentsConfigurations = (!this.loanProduct.dueDaysForRepaymentEvent && !this.loanProduct.overDueDaysForRepaymentEvent);
    });
  }

  ngOnInit() {
    this.loanProduct.allowAttributeConfiguration = Object.values(this.loanProduct.allowAttributeOverrides).some((attribute: boolean) => attribute);
  }

}
