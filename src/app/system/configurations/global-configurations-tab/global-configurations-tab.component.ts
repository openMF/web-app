/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from 'app/core/alert/alert.service';
import { SettingsService } from 'app/settings/settings.service';

/** Custom Services */
import { SystemService } from '../../system.service';

@Component({
  selector: 'mifosx-global-configurations-tab',
  templateUrl: './global-configurations-tab.component.html',
  styleUrls: ['./global-configurations-tab.component.scss']
})
export class GlobalConfigurationsTabComponent implements OnInit {

  /** Configuration data. */
  configurationData: any;
  /** Columns to be displayed in configurations table. */
  displayedColumns: string[] = ['name', 'country', 'ou', 'enabled', 'value', 'actions'];
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
  constructor(private alertService: AlertService,
              private systemService: SystemService) {
      this.configurationData = this.systemService.getConfigurations();
  }

  /**
   * Sets the configurations table.
   */
  ngOnInit() {
    this.setConfigurationData();
  }

  /**
   * Initializes the data source, paginator and sorter for configurations table.
   */
   setConfigurationData(): void {
    this.systemService.getConfigurations()
    .subscribe((configurationData: any) => {
      this.configurationData = configurationData.globalConfiguration;
      this.dataSource = new MatTableDataSource(this.configurationData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
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
    this.systemService.updateConfiguration(configuration.id, { enabled: !configuration.enabled }, '')
      .subscribe((response: any) => {
        configuration.enabled = response.changes.enabled;
        if (configuration.name === SettingsService.businessDateConfigName) {
          const msg = configuration.enabled ? 'enabled' : 'disabled';
          this.alertService.alert({type: SettingsService.businessDateType + ' Set Config', message: msg});
        }
      });
  }
}
