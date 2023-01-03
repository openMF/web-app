/** Angular Imports. */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/** Custom Services */
import { SearchService } from 'app/search/search.service';

@Component({
  selector: 'mifosx-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
})
export class ClientsComponent implements OnInit {
  @ViewChild('showClosedAccounts', { static: true }) showClosedAccounts: MatCheckbox;

  displayedColumns = ['name', 'clientNo', 'externalId', 'status', 'office', 'staff'];
  dataSource: MatTableDataSource<any>;

  existsClientsToFilter = false;
  notExistsClientsToFilter = false;
  moreClientsToFilter = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private searchService: SearchService) { }

  ngOnInit() {
    this.getClients('');
  }

  /**
   * Filter Client Data
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string = '') {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Searches server for query and resource.
   */
  search(value: string) {
    if (value !== '') {
      this.getClients(value);
    }
  }

  private getClients(value: string) {
    this.searchService.getSearchResults(value, 'clients').subscribe((data: any) => {
      this.dataSource = new MatTableDataSource(data);
      this.existsClientsToFilter = (data.length > 0);
      this.notExistsClientsToFilter = !this.existsClientsToFilter;
      this.moreClientsToFilter = (data.length > 50);
    });
  }
}
