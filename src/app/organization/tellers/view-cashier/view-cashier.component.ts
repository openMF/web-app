/** Angular Imports. */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * View Cashier component.
 */
@Component({
  selector: 'mifosx-view-cashier',
  templateUrl: './view-cashier.component.html',
  styleUrls: ['./view-cashier.component.scss']
})
export class ViewCashierComponent {

  /** Cashier data. */
  cashierData: any;

  /**
   * Get cashier data from `Resolver`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { cashier: any }) => {
      this.cashierData = data.cashier;
    });
  }

}
