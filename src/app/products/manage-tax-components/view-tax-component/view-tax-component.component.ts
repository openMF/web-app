/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * View tax Component component.
 */
@Component({
  selector: 'mifosx-view-tax-component',
  templateUrl: './view-tax-component.component.html',
  styleUrls: ['./view-tax-component.component.scss']
})
export class ViewTaxComponentComponent implements OnInit {

  /** tax Component Data. */
  taxComponentData: any;

  /**
   * Retrieves the tax Component data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { taxComponent: any }) => {
      this.taxComponentData = data.taxComponent;
    });
  }

  ngOnInit() {
  }

}
