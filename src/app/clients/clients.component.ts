/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Clients component.
 */
@Component({
  selector: 'mifosx-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {

  /** Clients data. */
  clientData: any;
  /** Columns to be displayed in clients table. */
  displayedColumns: string[] = ['name', 'clientno', 'externalid', 'status', 'mobileNo', 'gender', 'office', 'staff'];
  /** Data source for clients table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for clients table */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for clients table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the clients data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { clients: any }) => {
      this.clientData = data.clients;
    });
  }

  /**
   * Filters data in clients table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the clients table.
   */
  ngOnInit() {
    this.setClients();
  }

  /**
   * Initializes the data source, paginator and sorter for clients table.
   */
  setClients() {
    this.dataSource = new MatTableDataSource(this.clientData.pageItems);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = (data: any, property: any) => {
      switch (property) {
        case 'gender': return data.gender.name;
        default: return data[property];
      }
    };
    this.dataSource.sort = this.sort;
  }

}
