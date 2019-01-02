import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { Response} from '@angular/http';
import {ClientsService} from './clients.service';
import {DataSource} from '@angular/cdk/collections';
import { Observable } from 'rxjs';
@Component({
  selector: 'mifosx-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class ClientsComponent implements OnInit {
  post: any = [];
  private ELEMENT_DATA: any = undefined;
  displayedColumns =  ['name', 'clientno', 'externalid', 'status', 'mobileNo', 'gender', 'office', 'staff'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private clientService: ClientsService) {}

  ngOnInit() {
       this.getClients();
  }

  // GET from clients API
  getClients() {
    this.clientService.getClients()
    .subscribe(
      (res => {
        console.log(res);
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
