/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

/** Custom Services */
import { PopoverService } from '../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../configuration-wizard/configuration-wizard.service';

/**
 * Accounting component.
 */
@Component({
  selector: 'mifosx-accounting',
  templateUrl: './accounting.component.html',
  styleUrls: ['./accounting.component.scss']
})
export class AccountingComponent implements OnInit, AfterViewInit {

  /* Reference of Chart of Accounts */
  @ViewChild('chartofAccounts') chartofAccounts: ElementRef<any>;
  /* Template for popover on Chart of Accounts */
  @ViewChild('templateChartofAccounts') templateChartofAccounts: TemplateRef<any>;
  /* Reference of Accounts Linked */
  @ViewChild('accountsLinked') accountsLinked: ElementRef<any>;
  /* Template for popover on Accounts  Linked */
  @ViewChild('templateAccountsLinked') templateAccountsLinked: TemplateRef<any>;
  /* Reference of Migrate Opening Balances */
  @ViewChild('migrateOpeningBalances') migrateOpeningBalances: ElementRef<any>;
  /* Template for popover on Migrate Opening Balances */
  @ViewChild('templateMigrateOpeningBalances') templateMigrateOpeningBalances: TemplateRef<any>;
  /* Reference of Closing Entries */
  @ViewChild('closingEntries') closingEntries: ElementRef<any>;
  /* Template for popover on Closing Entries */
  @ViewChild('templateClosingEntries') templateClosingEntries: TemplateRef<any>;
  /* Reference of Create Journal Entries */
  @ViewChild('createJournalEntries') createJournalEntries: ElementRef<any>;
  /* Template for popover on Create Journal Entries */
  @ViewChild('templateCreateJournalEntries') templateCreateJournalEntries: TemplateRef<any>;

  /**
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) { }

  ngOnInit() {
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
    if (this.configurationWizardService.showChartofAccounts === true) {
      setTimeout(() => {
        this.showPopover(this.templateChartofAccounts, this.chartofAccounts.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showAccountsLinked === true) {
      setTimeout(() => {
        this.showPopover(this.templateAccountsLinked, this.accountsLinked.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showMigrateOpeningBalances === true) {
      setTimeout(() => {
        this.showPopover(this.templateMigrateOpeningBalances, this.migrateOpeningBalances.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showClosingEntries === true) {
      setTimeout(() => {
        this.showPopover(this.templateClosingEntries, this.closingEntries.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showCreateJournalEntries === true) {
      setTimeout(() => {
        this.showPopover(this.templateCreateJournalEntries, this.createJournalEntries.nativeElement, 'bottom', true);
      });
    }
  }

  /**
   * Next Step (Charts of Accounts Page) Configuration Wizard.
   */
  nextStepChartofAccounts() {
    this.configurationWizardService.showChartofAccounts = false;
    this.configurationWizardService.showChartofAccountsPage = true;
    this.router.navigate(['/accounting/chart-of-accounts']);
  }

  /**
   * Previous Step (Scheduler Jobs Page) Configuration Wizard.
   */
  previousStepChartofAccounts() {
    this.configurationWizardService.showChartofAccounts = false;
    this.configurationWizardService.showSchedulerJobsList = true;
    this.router.navigate(['/system/scheduler-jobs']);
  }

  /**
   * Next Step (Accounts Linked Page) Configuration Wizard.
   */
  nextStepAccountsLinked() {
    this.configurationWizardService.showAccountsLinked = false;
    this.configurationWizardService.showAccountsLinkedPage = true;
    this.router.navigate(['/accounting/financial-activity-mappings']);
  }

  /**
   * Previous Step (Create Chart of Accounts Page) Configuration Wizard.
   */
  previousStepAccountsLinked() {
    this.configurationWizardService.showAccountsLinked = false;
    this.configurationWizardService.showChartofAccountsForm = true;
    this.router.navigate(['/accounting/chart-of-accounts/gl-accounts/create']);
  }

  /**
   * Next Step (Migrate Opening Balances) Configuration Wizard.
   */
  nextStepMigrateOpeningBalances() {
    this.router.navigate(['/accounting/migrate-opening-balances']);
  }

  /**
   * Previous Step (Accounts Linked Page) Configuration Wizard.
   */
  previousStepMigrateOpeningBalances() {
    this.configurationWizardService.showMigrateOpeningBalances = false;
    this.configurationWizardService.showAccountsLinkedList = true;
    this.router.navigate(['accounting/financial-activity-mappings']);
  }

  /**
   * Next Step (Closing Entries Page) Configuration Wizard.
   */
  nextStepClosingEntries() {
    this.configurationWizardService.showClosingEntries = false;
    this.configurationWizardService.showClosingEntriesPage = true;
    this.router.navigate(['/accounting/closing-entries']);
  }

  /**
   * Previous Step (Migrate Opening Balances Page) Configuration Wizard.
   */
  previousStepClosingEntries() {
    this.configurationWizardService.showClosingEntries = false;
    this.configurationWizardService.showMigrateOpeningBalances = true;
    this.router.navigate(['/accounting/migrate-opening-balances']);
  }

  /**
   * Next Step (Create Journal Entries Page) Configuration Wizard.
   */
  nextStepCreateJournalEntries() {
    this.router.navigate(['/accounting/journal-entries/create']);
  }

  /**
   * Previous Step (Closing Entries Page) Configuration Wizard.
   */
  previousStepCreateJournalEntries() {
    this.configurationWizardService.showCreateJournalEntries = false;
    this.configurationWizardService.showClosingEntriesList = true;
    this.router.navigate(['/accounting/closing-entries']);
  }

}
