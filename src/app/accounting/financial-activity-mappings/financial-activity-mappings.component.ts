/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

/**
 * Financial activity mappings component.
 */
@Component({
  selector: 'mifosx-financial-activity-mappings',
  templateUrl: './financial-activity-mappings.component.html',
  styleUrls: ['./financial-activity-mappings.component.scss']
})
export class FinancialActivityMappingsComponent implements OnInit, AfterViewInit {

  /** Financial activity account data. */
  financialActivityAccountData: any;
  /** Columns to be displayed in financial activity mappings table. */
  displayedColumns: string[] = ['financialActivity', 'glAccountName', 'glAccountCode'];
  /** Data source for financial activity mappings table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for financial activity mappings table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for financial activity mappings table. */
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild('buttonDefineMapping') buttonDefineMapping: ElementRef<any>;
  @ViewChild('templateButtonDefineMapping') templateButtonDefineMapping: TemplateRef<any>;
  @ViewChild('activitiesTable') activitiesTable: ElementRef<any>;
  @ViewChild('templateActivitiesTable') templateActivitiesTable: TemplateRef<any>;

  /**
   * Retrieves the financial activity accounts data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe(( data: { financialActivityAccounts: any }) => {
      this.financialActivityAccountData = data.financialActivityAccounts;
    });
  }

  /**
   * Sets the financial activity mappings table.
   */
  ngOnInit() {
    this.setFinancialActivityAccounts();
  }

  /**
   * Initializes the data source, paginator and sorter for financial activity mappings table.
   */
  setFinancialActivityAccounts() {
    this.dataSource = new MatTableDataSource(this.financialActivityAccountData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = (financialActivityAccount: any, property: any) => {
      switch (property) {
        case 'financialActivity': return financialActivityAccount.financialActivityData.name;
        case 'glAccountName': return financialActivityAccount.glAccountData.name;
        case 'glAccountCode': return financialActivityAccount.glAccountData.glCode;
        default: return financialActivityAccount[property];
      }
    };
    this.dataSource.sort = this.sort;
  }

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  ngAfterViewInit() {
    if (this.configurationWizardService.showAccountsLinkedPage === true) {
      setTimeout(() => {
        this.showPopover(this.templateButtonDefineMapping, this.buttonDefineMapping.nativeElement, 'bottom', true);
      });
    }

    if (this.configurationWizardService.showAccountsLinkedList === true) {
      setTimeout(() => {
        this.showPopover(this.templateActivitiesTable, this.activitiesTable.nativeElement, 'top', true);
      });
    }
  }

  nextStep() {
    this.configurationWizardService.showAccountsLinkedPage = false;
    this.configurationWizardService.showAccountsLinkedList = false;
    this.configurationWizardService.showMigrateOpeningBalances = true;
    this.router.navigate(['/accounting']);
  }

  previousStep() {
    this.configurationWizardService.showAccountsLinkedPage = false;
    this.configurationWizardService.showAccountsLinkedList = false;
    this.configurationWizardService.showAccountsLinked = true;
    this.router.navigate(['/accounting']);
  }

}
