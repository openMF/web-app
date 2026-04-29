import { Component } from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-loan-product',
  templateUrl: './view-loan-product.component.html',
  styleUrls: ['./view-loan-product.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet
  ]
})
export class ViewLoanProductComponent {
  loanProductDatatables: any = [];

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { loanProductDatatables: any }) => {
      this.loanProductDatatables = data.loanProductDatatables;
    });
  }
}
