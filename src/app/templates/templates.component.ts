/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Templates component.
 */
@Component({
  selector: 'mifosx-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
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
export class TemplatesComponent implements OnInit {
  /** Templates data. */
  templatesData: any;
  /** Columns to be displayed in templates table. */
  displayedColumns: string[] = [
    'entity',
    'type',
    'name'
  ];
  /** Data source for templates table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for templates table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for templates table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the templates data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { templates: any }) => {
      this.templatesData = data.templates;
    });
  }

  /**
   * Filters data in templates table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the templates table.
   */
  ngOnInit() {
    this.setTemplates();
  }

  /**
   * Initializes the data source, paginator and sorter for templates table.
   */
  setTemplates() {
    this.dataSource = new MatTableDataSource(this.templatesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
