/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-surveys',
  templateUrl: './surveys.component.html',
  styleUrls: ['./surveys.component.scss'],
})
export class SurveysComponent implements OnInit {
  surveysData: any;
  displayedColumns: string[] = ['key', 'name', 'description', 'countryCode', 'status', 'action'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the codes data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { surveys: any }) => {
      this.surveysData = data.surveys;
    });
  }


  /**
   * Returns whether an element is active based on its active dates.
   * @param {number} validFrom Date valid from
   * @param {number} validTo Date valid to
   */
  isActive = function( validFrom: number, validTo: number) {
    const curdate = new Date().getTime();
    return (curdate > validFrom && curdate < validTo);
  };

  ngOnInit() {
    this.getSurveys();
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'status': return this.isActive(item.validFrom, item.validTo);
        case 'action': return this.isActive(item.validFrom, item.validTo);
        default: return item[property];
      }
    };
  }

  /**
   * Initializes the data source, paginator and sorter for codes table.
   */
  getSurveys() {
    this.dataSource = new MatTableDataSource(this.surveysData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters data in codes table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
