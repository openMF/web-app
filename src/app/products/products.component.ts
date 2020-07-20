/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

/** Custom Services */
import { PopoverService } from '../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../configuration-wizard/configuration-wizard.service';

/**
 * Products component.
 */
@Component({
  selector: 'mifosx-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, AfterViewInit {

  /* Reference of charges */
  @ViewChild('charges') charges: ElementRef<any>;
  /* Template for popover on charges */
  @ViewChild('templateCharges') templateCharges: TemplateRef<any>;
  /* Reference of loan products */
  @ViewChild('loanProducts') loanProducts: ElementRef<any>;
  /* Template for popover on loan products */
  @ViewChild('templateLoanProducts') templateLoanProducts: TemplateRef<any>;
  /* Reference of saving products */
  @ViewChild('savingsProducts') savingsProducts: ElementRef<any>;
  /* Template for popover on savings products */
  @ViewChild('templateSavingsProducts') templateSavingsProducts: TemplateRef<any>;
  /* Reference of share products */
  @ViewChild('shareProducts') shareProducts: ElementRef<any>;
  /* Template for popover on share products */
  @ViewChild('templateShareProducts') templateShareProducts: TemplateRef<any>;
  /* Reference of fixed deposit products */
  @ViewChild('fixedDepositProducts') fixedDepositProducts: ElementRef<any>;
  /* Template for popover on fixed deposit products */
  @ViewChild('templateFixedDepositProducts') templateFixedDepositProducts: TemplateRef<any>;
  /* Reference of recurring deposit products */
  @ViewChild('recurringDepositProducts') recurringDepositProducts: ElementRef<any>;
  /* Template for popover on recurring deposit products */
  @ViewChild('templateRecurringDepositProducts') templateRecurringDepositProducts: TemplateRef<any>;

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
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showCharges === true) {
      setTimeout(() => {
        this.showPopover(this.templateCharges, this.charges.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showLoanProducts === true) {
      setTimeout(() => {
        this.showPopover(this.templateLoanProducts, this.loanProducts.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showSavingsProducts === true) {
      setTimeout(() => {
        this.showPopover(this.templateSavingsProducts, this.savingsProducts.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showShareProducts === true) {
      setTimeout(() => {
        this.showPopover(this.templateShareProducts, this.shareProducts.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showFixedDepositProducts === true) {
      setTimeout(() => {
        this.showPopover(this.templateFixedDepositProducts, this.fixedDepositProducts.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showRecurringDepositProducts === true) {
      setTimeout(() => {
        this.showPopover(this.templateRecurringDepositProducts, this.recurringDepositProducts.nativeElement, 'bottom', true);
      });
    }
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
   * Next Step (Charges Page) Configuration Wizard.
   */
  nextStepCharges() {
    this.configurationWizardService.showCharges = false;
    this.configurationWizardService.showChargesPage = true;
    this.router.navigate(['/products/charges']);
  }

  /**
   * Previous Step (Create journal entry Page) Configuration Wizard.
   */
  previousStepCharges() {
    this.configurationWizardService.showCharges = false;
    this.configurationWizardService.showCreateJournalEntries = true;
    this.router.navigate(['/accounting/journal-entries/create']);
  }

  /**
   * Next Step (Loan Products Page) Configuration Wizard.
   */
  nextStepLoanProducts() {
    this.configurationWizardService.showLoanProducts = false;
    this.configurationWizardService.showLoanProductsPage = true;
    this.router.navigate(['/products/loan-products']);
  }

  /**
   * Previous Step (Charges Page) Configuration Wizard.
   */
  previousStepLoanProducts() {
    this.configurationWizardService.showLoanProducts = false;
    this.configurationWizardService.showChargesList = true;
    this.router.navigate(['/products/charges']);
  }

  /**
   * Next Step (Savings Products Page) Configuration Wizard.
   */
  nextStepSavingsProducts() {
    this.configurationWizardService.showSavingsProducts = false;
    this.configurationWizardService.showSavingsProductsPage = true;
    this.router.navigate(['/products/saving-products']);
  }

  /**
   * Previous Step (Savings Page) Configuration Wizard.
   */
  previousStepSavingsProducts() {
    this.configurationWizardService.showSavingsProducts = false;
    this.configurationWizardService.showLoanProductsList = true;
    this.router.navigate(['/products/loan-products']);
  }

  /**
   * Next Step (Share Products Page) Configuration Wizard.
   */
  nextStepShareProducts() {
    this.configurationWizardService.showShareProducts = false;
    this.configurationWizardService.showShareProductsPage = true;
    this.router.navigate(['/products/share-products']);
  }

  /**
   * Previous Step (Savings Products Page) Configuration Wizard.
   */
  previousStepShareProducts() {
    this.configurationWizardService.showShareProducts = false;
    this.configurationWizardService.showSavingsProductsList = true;
    this.router.navigate(['/products/saving-products']);
  }

  /**
   * Next Step (Fixed Deposit Products Page) Configuration Wizard.
   */
  nextStepFixedDepositProducts() {
    this.configurationWizardService.showFixedDepositProducts = false;
    this.configurationWizardService.showFixedDepositProductsPage = true;
    this.router.navigate(['/products/fixed-deposit-products']);
  }

  /**
   * Previous Step (Share Products Page) Configuration Wizard.
   */
  previousStepFixedDepositProducts() {
    this.configurationWizardService.showFixedDepositProducts = false;
    this.configurationWizardService.showShareProductsList = true;
    this.router.navigate(['/products/share-products']);
  }

  /**
   * Next Step (Recurring Deposit Products Page) Configuration Wizard.
   */
  nextStepRecurringDepositProducts() {
    this.configurationWizardService.showRecurringDepositProducts = false;
    this.configurationWizardService.showRecurringDepositProductsPage = true;
    this.router.navigate(['/products/recurring-deposit-products']);
  }

  /**
   * Previous Step (Fixed Deposit Products Page) Configuration Wizard.
   */
  previousStepRecurringDepositProducts() {
    this.configurationWizardService.showRecurringDepositProducts = false;
    this.configurationWizardService.showFixedDepositProductsList = true;
    this.router.navigate(['/products/fixed-deposit-products']);
  }
}
