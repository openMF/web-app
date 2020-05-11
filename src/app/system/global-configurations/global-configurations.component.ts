/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SystemService } from '../system.service';
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

/**
 * Global Configurations Component
 */
@Component({
  selector: 'mifosx-global-configurations',
  templateUrl: './global-configurations.component.html',
  styleUrls: ['./global-configurations.component.scss']
})
export class GlobalConfigurationsComponent implements OnInit, AfterViewInit {

  /** Configuration data. */
  configurationData: any;
  /** Columns to be displayed in configurations table. */
  displayedColumns: string[] = ['name', 'enabled', 'value', 'action', 'edit'];
  /** Data source for configurations table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for configurations table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for configurations table. */
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild('filter') filter: ElementRef<any>;
  @ViewChild('templateFilter') templateFilter: TemplateRef<any>;
  @ViewChild('configurationsTable') configurationsTable: ElementRef<any>;
  @ViewChild('templateConfigurationsTable') templateConfigurationsTable: TemplateRef<any>;

  /**
   * Retrieves the configurations data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {SystemService} systemService System Service.
   * @param {Router} router Router for navigation.
   */
  constructor(private route: ActivatedRoute,
              private systemService: SystemService,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
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

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  ngAfterViewInit() {
    if (this.configurationWizardService.showConfigurationsPage === true) {
      setTimeout(() => {
        this.showPopover(this.templateFilter, this.filter.nativeElement, 'bottom', true);
      });
    }

    if (this.configurationWizardService.showConfigurationsList === true) {
      setTimeout(() => {
        this.showPopover(this.templateConfigurationsTable, this.configurationsTable.nativeElement, 'top', true);
      });
    }
  }

  nextStep() {
    this.configurationWizardService.showConfigurationsPage = false;
    this.configurationWizardService.showConfigurationsList = false;
    this.configurationWizardService.showSchedulerJobs = true;
    this.router.navigate(['/system']);
  }

  previousStep() {
    this.configurationWizardService.showConfigurationsPage = false;
    this.configurationWizardService.showConfigurationsList = false;
    this.configurationWizardService.showConfigurations = true;
    this.router.navigate(['/system']);
  }

}
