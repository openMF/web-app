/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';

/**
 * View Survey component.
 */
@Component({
  selector: 'mifosx-view-survey',
  templateUrl: './view-survey.component.html',
  styleUrls: ['./view-survey.component.scss']
})
export class ViewSurveyComponent implements OnInit {

  surveyData: any;
  /** Data source for view surveys table. */
  dataSource: MatTableDataSource<any>;
  /** Columns to be displayed in list of surveys table. */
  displayedColumns: string[] = ['surveyName', 'createdBy', 'date', 'score'];
  /** Paginator for list of surveys table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for list of surveys table. */
  @ViewChild(MatSort) sort: MatSort;


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
    this.constructSurvey(this.surveyData);
  }

  /**
   * Constructs the list of survey data
   * @param data Survey Data
   */
  constructSurvey(data: any) {
    const surveys: any[] = [];
    data.forEach((ele: { id: number, userId: number, username: string, clientId: number, surveyId: number, surveyName: string, scorecardValues: Object[] }) => {
      ele.scorecardValues.forEach((element: { createdOn: number, value: number }) => {
        const item = {} as { surveyName: string, createdby: string, date: number, score: number };
        item.surveyName = ele.surveyName;
        item.createdby = ele.username;
        item.date = element.createdOn;
        item.score = element.value;
        surveys.push(item);
      });
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
