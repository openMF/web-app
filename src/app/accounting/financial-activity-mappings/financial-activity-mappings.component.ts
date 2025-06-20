/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Financial activity mappings component.
 */
@Component({
  selector: 'mifosx-financial-activity-mappings',
  templateUrl: './financial-activity-mappings.component.html',
  styleUrls: ['./financial-activity-mappings.component.scss'],
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
export class FinancialActivityMappingsComponent implements OnInit, AfterViewInit {
  /** Financial activity account data. */
  financialActivityAccountData: any;
  /** Columns to be displayed in financial activity mappings table. */
  displayedColumns: string[] = [
    'financialActivity',
    'glAccountType',
    'glAccountCode',
    'glAccountName'
  ];
  /** Data source for financial activity mappings table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for financial activity mappings table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for financial activity mappings table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of define mapping button */
  @ViewChild('buttonDefineMapping') buttonDefineMapping: ElementRef<any>;
  /* Template for popover on define mapping button */
  @ViewChild('templateButtonDefineMapping') templateButtonDefineMapping: TemplateRef<any>;
  /* Reference of Activities table */
  @ViewChild('activitiesTable') activitiesTable: ElementRef<any>;
  /* Template for popover on Activities table */
  @ViewChild('templateActivitiesTable') templateActivitiesTable: TemplateRef<any>;

  /**
   * Retrieves the financial activity accounts data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private configurationWizardService: ConfigurationWizardService,
    private popoverService: PopoverService
  ) {
    this.route.data.subscribe((data: { financialActivityAccounts: any }) => {
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
        case 'financialActivity':
          return financialActivityAccount.financialActivityData.name;
        case 'glAccountName':
          return financialActivityAccount.glAccountData.name;
        case 'glAccountCode':
          return financialActivityAccount.glAccountData.glCode;
        default:
          return financialActivityAccount[property];
      }
    };
    this.dataSource.sort = this.sort;
  }

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(
    template: TemplateRef<any>,
    target: HTMLElement | ElementRef<any>,
    position: string,
    backdrop: boolean
  ): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * To show popover.
   */
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

  /**
   * Next Step (Migrate Opening Balances Accounting Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showAccountsLinkedPage = false;
    this.configurationWizardService.showAccountsLinkedList = false;
    this.configurationWizardService.showMigrateOpeningBalances = true;
    this.router.navigate(['/accounting']);
  }

  /**
   * Previous Step (Accounts Linked Accounting Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showAccountsLinkedPage = false;
    this.configurationWizardService.showAccountsLinkedList = false;
    this.configurationWizardService.showAccountsLinked = true;
    this.router.navigate(['/accounting']);
  }
}
