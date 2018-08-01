import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-chart-of-accounts',
  templateUrl: './chart-of-accounts.component.html',
  styleUrls: ['./chart-of-accounts.component.scss']
})
export class ChartOfAccountsComponent implements AfterViewInit, OnInit {

  viewGroup = new FormControl('listView');
  glAccountData: any;

  displayedColumns: string[] = ['name', 'glCode', 'glAccountType', 'disabled', 'manualEntriesAllowed', 'usedAs'];
  tableDataSource: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { glAccountData: any }) => {
      this.glAccountData = data.glAccountData;
    });
  }

  ngOnInit() {
    this.tableDataSource = new MatTableDataSource(this.glAccountData);
  }

  ngAfterViewInit() {
    this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sortingDataAccessor = (glAccount: any, property: any) => {
      switch (property) {
        case 'glAccountType': return glAccount.type.value;
        case 'usedAs': return glAccount.usage.value;
        default: return glAccount[property];
      }
    };
    this.tableDataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
  }

  viewGLAccount(glAccount: any) {
    console.log(glAccount);
  }

}
