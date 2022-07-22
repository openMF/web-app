import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-delinquency-range',
  templateUrl: './delinquency-range.component.html',
  styleUrls: ['./delinquency-range.component.scss']
})
export class DelinquencyRangeComponent implements OnInit {

  delinquencyRangeData: any;
  /** Columns to be displayed in delinquency range table. */
  displayedColumns: string[] = ['classification', 'minimumAgeDays', 'maximumAgeDays'];
  /** Data source for delinquency range table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for delinquency range table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for delinquency range table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { delinquencyRanges: any }) => {
      this.delinquencyRangeData = data.delinquencyRanges;
    });
  }

  ngOnInit(): void {
    this.setDatasource();
  }

  /**
   * Filters data in delinquency range table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
   applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Initializes the data source, paginator and sorter for delinquency range table.
   */
  setDatasource() {
    this.dataSource = new MatTableDataSource(this.delinquencyRangeData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
