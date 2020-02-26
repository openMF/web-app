/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTable } from '@angular/material/table';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * NotariosTabComponent component.
 */
@Component({
  selector: 'mifosx-notarios-tab',
  templateUrl: './notarios-tab.component.html',
  styleUrls: ['./notarios-tab.component.scss']
})
export class NotariosTabComponent implements OnInit {


  /** Office data. */
  officeData: any;
  /** Datatables Data data. */
  dataTablesData: any;
  /** DatatablesDetails Data data. */
  tableDetailsData: any;
  /** Temp Variable to append data to tablesData array */
  temp: any = {};
  /** Tables Data Array. */
  tablesData: Array<any> = [];
  /** Columns to be displayed in dataTable. */
  displayedColumns: string[] = ['id', 'office_id', 'NUMERO', 'NOMBRE', 'DOMICILIO'];
  /** Data source for dataTable. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for dataTable. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for dataTable. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the officesData, datatablesData and tableDetailsData from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { dataTable: any }) => {
      this.dataTablesData = data.dataTable;
    });
    this.route.data.subscribe((data: { office: any }) => {
      this.officeData = data.office;
    });
    this.route.data.subscribe((data: { tableDetails: any }) => {
      this.tableDetailsData = data.tableDetails;
    });
    for (let i = 0; i < this.tableDetailsData.data.length; i++) {
      this.temp = {};
      for (let j = 0; j < 5; j++) {
        this.temp[this.tableDetailsData.columnHeaders[j].columnName] = this.tableDetailsData.data[i].row[j];
      }
      this.tablesData.push(this.temp);

    }
  }

  /**
   * Sets the dataTable.
   */
  ngOnInit() {
  this.setTableDetails();
  }

  /**
   * Initializes the data source, paginator and sorter for dataTable.
   */
  setTableDetails() {
    this.dataSource = new MatTableDataSource(this.tablesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
