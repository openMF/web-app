/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material';

/**
 * Campaign tab component.
 */

@Component({
  selector: 'mifosx-campaign-tab',
  templateUrl: './campaign-tab.component.html',
  styleUrls: ['./campaign-tab.component.scss']
})
export class CampaignTabComponent implements OnInit {

  /** SMS Campaign data. */
  smsCampaignData: any;

  /**
   * Retrieves the SMS Campaign data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { smsCampaign: any }) => {
      this.smsCampaignData = data.smsCampaign;
    });
  }

  ngOnInit() {
  }

}
