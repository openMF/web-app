import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { CentersService } from 'app/centers/centers.service';
import {DataSource} from '@angular/cdk/collections';
import { Observable } from 'rxjs';

@Component({
  selector: 'mifosx-app-centers',
  templateUrl: './centers.component.html',
  styleUrls: ['./centers.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CentersComponent implements OnInit {
  private ELEMENT_DATA: any = undefined;
  displayedColumns =  ['name', 'accountno', 'externalid', 'status', 'office'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private centerService: CentersService) { }

  ngOnInit() {
      this.centerService.getCenters()
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
