import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'mifosx-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class ClientsComponent implements OnInit {
  post: any = [];

  displayedColumns = ['name', 'clientno', 'externalid', 'status', 'mobileNo', 'gender', 'office', 'staff'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((clientsData: { clientsData: any }) => {
      const res = clientsData.clientsData.pageItems;
      res.active = !!res.active;
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sortingDataAccessor = (data: any, property: any) => {
        switch (property) {
          case 'gender': return data.gender.name;
          default: return data[property];
        }
      };
      this.dataSource.sort = this.sort;
    });
  }


  ngOnInit() { }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
