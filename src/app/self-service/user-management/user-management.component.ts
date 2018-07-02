import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

export interface User {
  name: string;
  userID: string;
  emailID: string;
  status: string;
  office: string;
  staff: string;
}

const USER_DATA: User[] = [
  { name: 'Data 1', userID: 'Data', emailID: 'Data', status: 'Data', office: 'Data', staff: 'Data' },
  { name: 'Data 2', userID: 'Data', emailID: 'Data', status: 'Data', office: 'Data', staff: 'Data' },
  { name: 'Data 3', userID: 'Data', emailID: 'Data', status: 'Data', office: 'Data', staff: 'Data' },
  { name: 'Data 4', userID: 'Data', emailID: 'Data', status: 'Data', office: 'Data', staff: 'Data' },
  { name: 'Data 5', userID: 'Data', emailID: 'Data', status: 'Data', office: 'Data', staff: 'Data' },
  { name: 'Data 6', userID: 'Data', emailID: 'Data', status: 'Data', office: 'Data', staff: 'Data' },
  { name: 'Data 7', userID: 'Data', emailID: 'Data', status: 'Data', office: 'Data', staff: 'Data' },
  { name: 'Data 8', userID: 'Data', emailID: 'Data', status: 'Data', office: 'Data', staff: 'Data' },
  { name: 'Data 9', userID: 'Data', emailID: 'Data', status: 'Data', office: 'Data', staff: 'Data' },
  { name: 'Data 10', userID: 'Data', emailID: 'Data', status: 'Data', office: 'Data', staff: 'Data' }
];

@Component({
  selector: 'mifosx-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  // page = 1;
  // isCollapsed = true;
  displayedColumns: string[] = ['select', 'name', 'userID', 'emailID', 'status', 'office', 'staff'];
  dataSource = new MatTableDataSource(USER_DATA);
  selection = new SelectionModel<User>(true, []);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor() { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

}
