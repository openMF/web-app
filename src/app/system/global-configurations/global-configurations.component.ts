/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Global Configurations Component
 */
@Component({
  selector: 'mifosx-global-configurations',
  templateUrl: './global-configurations.component.html',
  styleUrls: ['./global-configurations.component.scss']
})
export class GlobalConfigurationsComponent implements OnInit {

  /** Configuration data. */
  configurationData: any;
  /** Columns to be displayed in configurations table. */
  displayedColumns: string[] = ['name', 'enabled', 'value', 'action', 'edit'];
  /** Data source for configurations table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for configurations table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for configurations table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the configurations data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {SystemService} systemService System Service.
   * @param {Router} router Router for navigation.
   */
  constructor(private route: ActivatedRoute,
              private systemService: SystemService,
              private router: Router) {
    this.route.data.subscribe((data: { configurations: any }) => {
      this.configurationData = data.configurations.globalConfiguration;
    });
  }

  /**
   * Sets the configurations table.
   */
  ngOnInit() {
    this.setConfigurations();
  }

  /**
   * Initializes the data source, paginator and sorter for configurations table.
   */
  setConfigurations() {
    this.dataSource = new MatTableDataSource(this.configurationData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters data in configurations table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Enables/Disables respective configuration
   */
  toggleStatus(configuration: any) {
    this.systemService.updateConfiguration(configuration.id, { enabled: !configuration.enabled })
      .subscribe((response: any) => {
        configuration.enabled = response.changes.enabled;
      });
  }

}
