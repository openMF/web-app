import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-delinquency-bucket',
  templateUrl: './delinquency-bucket.component.html',
  styleUrls: ['./delinquency-bucket.component.scss']
})
export class DelinquencyBucketComponent implements OnInit {

  delinquencyBucketData: any;
  /** Columns to be displayed in delinquency bucket table. */
  displayedColumns: string[] = ['name'];
  /** Data source for delinquency bucket table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for delinquency bucket table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for delinquency bucket table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { delinquencyBuckets: any }) => {
      this.delinquencyBucketData = data.delinquencyBuckets;
    });
  }

  ngOnInit(): void {
    this.setDatasource();
  }

  /**
   * Filters data in delinquency bucket table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
   applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Initializes the data source, paginator and sorter for delinquency bucket table.
   */
  setDatasource() {
    this.dataSource = new MatTableDataSource(this.delinquencyBucketData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
