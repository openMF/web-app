/** Angular Imports */
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { GroupsService } from './groups.service';

@Component({
  selector: 'mifosx-app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

  private ELEMENT_DATA: any = undefined;
  displayedColumns =  ['name', 'accountno', 'externalid', 'status', 'office'];
  dataSource = new MatTableDataSource();
  groupsData: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private groupService: GroupsService,
    private route: ActivatedRoute) {
    this.route.data.subscribe((data: { groupsData: any
    }) => {
      this.groupsData = data.groupsData;
    });

    this.groupsData.active = !!this.groupsData.active;
    this.dataSource = new MatTableDataSource(this.groupsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {
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
