/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * View tax Group component.
 */
@Component({
  selector: 'mifosx-view-tax-group',
  templateUrl: './view-tax-group.component.html',
  styleUrls: ['./view-tax-group.component.scss']
})
export class ViewTaxGroupComponent implements OnInit {

  /** tax Group Data. */
  taxGroupData: any;

  /**
   * Retrieves the tax Group data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { taxGroup: any }) => {
      this.taxGroupData = data.taxGroup;
    });
  }

  ngOnInit() {
  }

}
