/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-share-products',
  templateUrl: './share-products.component.html',
  styleUrls: ['./share-products.component.scss']
})
export class ShareProductsComponent implements OnInit {

  shareProductsData: any;
  displayedColumns: string[] = ['name', 'shortName', 'totalShares'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { shareProducts: any }) => {
      this.shareProductsData = data.shareProducts.pageItems;
    });
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.shareProductsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
