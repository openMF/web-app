/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Create Center General Tab Component
 */
@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss']
})
export class GeneralTabComponent implements OnInit {

  /** Savings Account Table Columns */
  savingsAccountColumns: string[] = ['Account No', 'Products', 'Balance', 'Actions'];
  /** Groups Table Columns */
  groupsColumns: string[] = ['Account No', 'Group Name', 'Office Name', 'Submitted On'];
  /** Stores the summary of center */
  centerSummaryData: any;
  /** Stores Center Data for particular center */
  centerViewData: any;
  /** Stores Saving Account for particular center */
  savingsAccountData: any;
  /** Stores Group Data */
  groupResourceData: any;

  /**
   * Retrieves the data for centers
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: {
      centerSummaryData: any,
      centerViewData: any,
      savingsAccountData: any
    }) => {
      this.centerSummaryData = data.centerSummaryData[0];
      this.centerViewData = data.centerViewData;
      this.savingsAccountData = data.savingsAccountData.savingsAccounts;
      this.groupResourceData = data.centerViewData.groupMembers;
    });
  }

  ngOnInit() {
  }


  /**
   * Stops the propagation to view pages.
   * @param $event Mouse Event
   */
  routeEdit($event: MouseEvent) {
    $event.stopPropagation();
  }

}
