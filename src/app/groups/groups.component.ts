import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { GroupsService } from './groups.service';
import {DataSource} from '@angular/cdk/collections';
import { Observable } from 'rxjs';
@Component({
  selector: 'mifosx-app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

  private ELEMENT_DATA: any = undefined;
  displayedColumns =  ['name', 'accountno', 'externalid', 'status', 'office'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private groupService: GroupsService) { }

  ngOnInit() {
      this.groupService.getGroups()
      .subscribe(
        (res => {
         console.log(res);
        // console.log(res.active);
         res.active = !!res.active;
         this.dataSource = new MatTableDataSource(res);
         this.dataSource.paginator = this.paginator;
         this.dataSource.sort = this.sort;
        })
      );
  }


  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
