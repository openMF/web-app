import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { ProductsService } from 'app/products/products.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-dividend',
  templateUrl: './view-dividend.component.html',
  styleUrls: ['./view-dividend.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ]
})
export class ViewDividendComponent implements OnInit {
  dividendData: any;
  status: any;
  isdividendPosted = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = [
    'clientName',
    'shareAccount',
    'dividendAmount',
    'status'
  ];
  dataSource: MatTableDataSource<any>;

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private router: Router
  ) {
    this.route.data.subscribe((data: { dividendData: any }) => {
      this.dividendData = data.dividendData;
    });
    this.status = this.route.snapshot.queryParams['status'];
    if (this.status && (this.status === 'Dividend Approved' || this.status === 'Dividend Posted')) {
      this.isdividendPosted = true;
    }
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.dividendData.pageItems);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  postDividends() {
    const shareProductId = this.route.parent.parent.snapshot.paramMap.get('productId');
    const dividendId = this.route.snapshot.paramMap.get('dividendId');
    this.productsService
      .approveDividend(shareProductId, dividendId, { productId: shareProductId, dividendId: dividendId })
      .subscribe(() => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
