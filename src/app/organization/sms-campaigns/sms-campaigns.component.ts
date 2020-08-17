/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * SMS Campaigns component.
 */
@Component({
  selector: 'mifosx-sms-campaigns',
  templateUrl: './sms-campaigns.component.html',
  styleUrls: ['./sms-campaigns.component.scss']
})
export class SmsCampaignsComponent implements OnInit {

  /** SMS Campaigns data. */
  smsCampaignsData: any;
  /** Columns to be displayed in sms campaigns table. */
  displayedColumns: string[] = ['campaignName', 'campaignMessage', 'campaignType.value', 'triggerType.value', 'campaignStatus.value', 'smsCampaignTimeLine.submittedByUsername'];
  /** Data source for SMS campaigns table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for SMS campaigns table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for SMS campaigns table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the SMS campaigns data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { smsCampaigns: any }) => {
      this.smsCampaignsData = data.smsCampaigns.pageItems;
    });
  }

  /**
   * Filters data in SMS campaigns table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the SMS campaigns table.
   */
  ngOnInit() {
    this.setSmsCampaigns();
  }

  /**
   * Initializes the data source, paginator and sorter for SMS campaigns table.
   */
  setSmsCampaigns() {
    this.dataSource = new MatTableDataSource(this.smsCampaignsData);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'campaignType.value': return item.campaignType.value;
        case 'triggerType.value': return item.triggerType.value;
        case 'campaignStatus.value': return item.campaignStatus.value;
        case 'smsCampaignTimeLine.submittedByUsername': return item.smsCampaignTimeLine.submittedByUsername;
        default: return item[property];
      }
    };
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
