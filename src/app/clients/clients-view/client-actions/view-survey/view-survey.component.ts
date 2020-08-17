/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/**
 * View Survey component.
 */
@Component({
  selector: 'mifosx-view-survey',
  templateUrl: './view-survey.component.html',
  styleUrls: ['./view-survey.component.scss']
})
export class ViewSurveyComponent implements OnInit {

  /** Survey Data */
  surveyData: any;
  /** Data source for view surveys table. */
  dataSource: MatTableDataSource<any>;
  /** Columns to be displayed in list of surveys table. */
  displayedColumns: string[] = ['surveyName', 'createdBy', 'date', 'score'];

  /** Paginator for list of surveys table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for list of surveys table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  /**
   * Retrieves the survey data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.surveyData = data.clientActionData;
    });
  }

  ngOnInit() {
    this.constructSurveys(this.surveyData);
  }

  /**
   * Sets datasource, paginator and sorter for surveys table.
   * @param data Survey Data
   */
  constructSurveys(data: any) {
    let surveys: any[] = [];
    data.forEach((entry: any) => {
      const scoreCards: any[] = entry.scorecardValues.map((element: any) => {
        return {
          surveyName: entry.surveyName,
          createdBy: entry.username,
          date: element.createdOn,
          score: element.value
        };
      });
      surveys = surveys.concat(scoreCards);
    });
    this.dataSource = new MatTableDataSource(surveys);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters data in list of surveys table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
