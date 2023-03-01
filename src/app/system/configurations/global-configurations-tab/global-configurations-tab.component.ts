/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertService } from 'app/core/alert/alert.service';
import { SettingsService } from 'app/settings/settings.service';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SystemService } from '../../system.service';
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../../configuration-wizard/configuration-wizard.service';

@Component({
  selector: 'mifosx-global-configurations-tab',
  templateUrl: './global-configurations-tab.component.html',
  styleUrls: ['./global-configurations-tab.component.scss']
})
export class GlobalConfigurationsTabComponent implements OnInit, AfterViewInit {

  /** Configuration data. */
  configurationData: any;
  /** Columns to be displayed in configurations table. */
  displayedColumns: string[] = ['name', 'enabled', 'value', 'stringValue', 'dateValue', 'edit'];
  /** Data source for configurations table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for configurations table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for configurations table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of filter */
  @ViewChild('filter') filter: ElementRef<any>;
  /* Template for popover on filter */
  @ViewChild('templateFilter') templateFilter: TemplateRef<any>;
  /* Reference of configurations table */
  @ViewChild('configurationsTable') configurationsTable: ElementRef<any>;
  /* Template for popover on configurations table */
  @ViewChild('templateConfigurationsTable') templateConfigurationsTable: TemplateRef<any>;

  /**
   * Retrieves the configurations data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {SystemService} systemService System Service.
   * @param {Router} router Router for navigation.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private route: ActivatedRoute,
              private alertService: AlertService,
              private systemService: SystemService,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
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
    this.systemService.updateConfiguration(configuration.id, { enabled: !configuration.enabled })
      .subscribe((response: any) => {
        configuration.enabled = response.changes.enabled;
        if (configuration.name === SettingsService.businessDateConfigName) {
          const msg = configuration.enabled ? 'enabled' : 'disabled';
          this.alertService.alert({type: SettingsService.businessDateType + ' Set Config', message: msg});
        }
      });
  }

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
   showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * To show popover.
   */
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

  /**
   * Next Step (Scheduler Jobs System Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showConfigurationsPage = false;
    this.configurationWizardService.showConfigurationsList = false;
    this.configurationWizardService.showSchedulerJobs = true;
    this.router.navigate(['/system']);
  }

  /**
   * Previous Step (Global Configurations System Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showConfigurationsPage = false;
    this.configurationWizardService.showConfigurationsList = false;
    this.configurationWizardService.showConfigurations = true;
    this.router.navigate(['/system']);
  }
}
