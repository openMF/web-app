/** Angular Imports. */
import { Component, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ClientsDataSource } from './clients.datasource';

/** rxjs Imports */
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

/** Custom Services */
import { ClientsService } from './clients.service';

@Component({
  selector: 'mifosx-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
})
export class ClientsComponent implements OnInit, AfterViewInit {
  @ViewChild('showClosedAccounts', { static: true }) showClosedAccounts: MatCheckbox;

  constructor(private clientsService: ClientsService) {
    this.getScreenSize();
  }

  displayedColumns = ['name', 'clientno', 'externalid', 'status', 'mobileNo', 'gender', 'office', 'staff'];

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    if (window.innerWidth < 500) {
      this.displayedColumns = ['name', 'externalid', 'status', 'staff'];
      console.debug('Mobile View');
    } else {
      console.debug('Desktop View');
    }
  }

  dataSource: ClientsDataSource;
  /** Get the required filter value. */
  searchValue = '';

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit() {
    this.getClients();
  }
  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page, this.showClosedAccounts.change)
      .pipe(
        tap(() => this.loadClientsPage())
      )
      .subscribe();
  }

  /**
   * Loads a page of journal entries.
   */
  loadClientsPage() {
    if (!this.sort.direction) {
      delete this.sort.active;
    }

    if (this.searchValue !== '') {
      this.applyFilter(this.searchValue);
    } else {
      this.dataSource.getClients(this.sort.active, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize, !this.showClosedAccounts.checked);
    }
  }

  /**
   * Initializes the data source for clients table and loads the first page.
   */
  getClients() {
    this.dataSource = new ClientsDataSource(this.clientsService);
    this.dataSource.getClients(this.sort.active, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize, !this.showClosedAccounts.checked);
  }

  /**
   * Filter Client Data
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string = '') {
    this.searchValue = filterValue;
    this.dataSource.filterClients(filterValue.trim().toLowerCase(), this.sort.active, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize, !this.showClosedAccounts.checked);
  }

}
