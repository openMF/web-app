import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-view-fund',
  templateUrl: './view-fund.component.html',
  styleUrls: ['./view-fund.component.scss']
})
export class ViewFundComponent implements OnInit {

  /** Fund data. */
  fundData: any;

  /**
   * Retrieves the charge data from `resolve`.
   * @param {Router} router Router for navigation.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { fundData: any }) => {
      this.fundData = data.fundData;
    });
  }

  ngOnInit() {
  }

}
