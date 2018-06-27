import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { Response} from '@angular/http';
import {ClientsService} from './clients.service';
import {DataSource} from '@angular/cdk/collections';
import { Observable } from 'rxjs';
@Component({
  selector: 'mifosx-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  post: any = [];
  jsonpost: any = {};
  private ELEMENT_DATA: any = null;
  displayedColumns = ['id', 'name', 'progress', 'color'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private clientService: ClientsService) {
    //
      // GET from clients API
      this.clientService.getServer()
      .subscribe(
        (res => {
        //  this.post = res;
        //  this.ELEMENT_DATA = res;
        console.log(res);
        this.ELEMENT_DATA = res;
 // this.displayedColumns = [.............];
        this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
        // console.log('print');
      //  console.table(res[1]);
       // console.log(this.dataSource.data);
      //  console.table(JSON.stringify(res));
        })
      );
    // Create 100 users
   /*  const users: UserData[] = [];
    for (let i = 1; i <= 100; i++) { users.push(createNewUser(i)); } */
   // const ELEMENT_DATA: any = JSON.stringify(this.post);
    // Assign the data to the data source for the table to render
// this.dataSource =  new MatTableDataSource(this.ELEMENT_DATA);

  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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


/* export class UserDataSource extends DataSource<any> {
  constructor(private clientService: ClientsService) {
    super();
  }
  connect(): Observable<any> {
    this.clientService.getServer()
    .subscribe(
      (res) => {
        this.post = res;
      console.table(res[1]);
      });
  }
  disconnect() {}
}  */
/* 
const COLORS = ['maroon', 'red', 'orange', 'yellow', 'olive', 'green', 'purple',
  'fuchsia', 'lime', 'teal', 'aqua', 'blue', 'navy', 'black', 'gray'];
const NAMES = ['Maia', 'Asher', 'Olivia', 'Atticus', 'Amelia', 'Jack',
  'Charlotte', 'Theodore', 'Isla', 'Oliver', 'Isabella', 'Jasper',
  'Cora', 'Levi', 'Violet', 'Arthur', 'Mia', 'Thomas', 'Elizabeth'];

function createNewUser(id: number): UserData {
  const name =
      NAMES[Math.round(Math.random() * (NAMES.length - 1))] + ' ' +
      NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) + '.';

  return {
    id: id.toString(),
    name: name,
    progress: Math.round(Math.random() * 100).toString(),
    color: COLORS[Math.round(Math.random() * (COLORS.length - 1))]
  };
}



export interface UserData {
  id: string;
  name: string;
  progress: string;
  color: string;
} */

