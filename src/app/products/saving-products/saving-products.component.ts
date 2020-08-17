/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-saving-products',
  templateUrl: './saving-products.component.html',
  styleUrls: ['./saving-products.component.scss']
})
export class SavingProductsComponent implements OnInit {

  savingProductsData: any;
  displayedColumns: string[] = ['name', 'shortName'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { savingProducts: any }) => {
      this.savingProductsData = data.savingProducts;
    });
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.savingProductsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
