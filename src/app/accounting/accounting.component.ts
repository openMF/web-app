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

  @ViewChild('chartofAccounts') chartofAccounts: ElementRef<any>;
  @ViewChild('templateChartofAccounts') templateChartofAccounts: TemplateRef<any>;
  @ViewChild('accountsLinked') accountsLinked: ElementRef<any>;
  @ViewChild('templateAccountsLinked') templateAccountsLinked: TemplateRef<any>;
  @ViewChild('migrateOpeningBalances') migrateOpeningBalances: ElementRef<any>;
  @ViewChild('templateMigrateOpeningBalances') templateMigrateOpeningBalances: TemplateRef<any>;
  @ViewChild('closingEntries') closingEntries: ElementRef<any>;
  @ViewChild('templateClosingEntries') templateClosingEntries: TemplateRef<any>;
  @ViewChild('createJournalEntries') createJournalEntries: ElementRef<any>;
  @ViewChild('templateCreateJournalEntries') templateCreateJournalEntries: TemplateRef<any>;

  constructor(private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) { }

  ngOnInit() {
  }

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

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

  nextStepChartofAccounts() {
    this.configurationWizardService.showChartofAccounts = false;
    this.configurationWizardService.showChartofAccountsPage = true;
    this.router.navigate(['/accounting/chart-of-accounts']);
  }

  previousStepChartofAccounts() {
    this.configurationWizardService.showChartofAccounts = false;
    this.configurationWizardService.showSchedulerJobsList = true;
    this.router.navigate(['/system/scheduler-jobs']);
  }

  nextStepAccountsLinked() {
    this.configurationWizardService.showAccountsLinked = false;
    this.configurationWizardService.showAccountsLinkedPage = true;
    this.router.navigate(['/accounting/financial-activity-mappings']);
  }

  previousStepAccountsLinked() {
    this.configurationWizardService.showAccountsLinked = false;
    this.configurationWizardService.showChartofAccountsForm = true;
    this.router.navigate(['/accounting/chart-of-accounts/gl-accounts/create']);
  }

  nextStepMigrateOpeningBalances() {
    this.router.navigate(['/accounting/migrate-opening-balances']);
  }

  previousStepMigrateOpeningBalances() {
    this.configurationWizardService.showMigrateOpeningBalances = false;
    this.configurationWizardService.showAccountsLinkedList = true;
    this.router.navigate(['accounting/financial-activity-mappings']);
  }

  nextStepClosingEntries() {
    this.configurationWizardService.showClosingEntries = false;
    this.configurationWizardService.showClosingEntriesPage = true;
    this.router.navigate(['/accounting/closing-entries']);
  }

  previousStepClosingEntries() {
    this.configurationWizardService.showClosingEntries = false;
    this.configurationWizardService.showMigrateOpeningBalances = true;
    this.router.navigate(['/accounting/migrate-opening-balances']);
  }

  nextStepCreateJournalEntries() {
    this.router.navigate(['/accounting/journal-entries/create']);
  }

  previousStepCreateJournalEntries() {
    this.configurationWizardService.showCreateJournalEntries = false;
    this.configurationWizardService.showClosingEntriesList = true;
    this.router.navigate(['/accounting/closing-entries']);
  }

}
