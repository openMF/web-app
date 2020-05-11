/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

import { Router } from '@angular/router';

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

  @ViewChild('charges') charges: ElementRef<any>;
  @ViewChild('templateCharges') templateCharges: TemplateRef<any>;
  @ViewChild('loanProducts') loanProducts: ElementRef<any>;
  @ViewChild('templateLoanProducts') templateLoanProducts: TemplateRef<any>;
  @ViewChild('savingsProducts') savingsProducts: ElementRef<any>;
  @ViewChild('templateSavingsProducts') templateSavingsProducts: TemplateRef<any>;
  @ViewChild('shareProducts') shareProducts: ElementRef<any>;
  @ViewChild('templateShareProducts') templateShareProducts: TemplateRef<any>;
  @ViewChild('fixedDepositProducts') fixedDepositProducts: ElementRef<any>;
  @ViewChild('templateFixedDepositProducts') templateFixedDepositProducts: TemplateRef<any>;
  @ViewChild('recurringDepositProducts') recurringDepositProducts: ElementRef<any>;
  @ViewChild('templateRecurringDepositProducts') templateRecurringDepositProducts: TemplateRef<any>;

  constructor(private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) { }

  ngOnInit() {
  }

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

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  nextStepCharges() {
    this.configurationWizardService.showCharges = false;
    this.configurationWizardService.showChargesPage = true;
    this.router.navigate(['/products/charges']);
  }

  previousStepCharges() {
    this.configurationWizardService.showCharges = false;
    this.configurationWizardService.showCreateJournalEntries = true;
    this.router.navigate(['/accounting/journal-entries/create']);
  }

  nextStepLoanProducts() {
    this.configurationWizardService.showLoanProducts = false;
    this.configurationWizardService.showLoanProductsPage = true;
    this.router.navigate(['/products/loan-products']);
  }

  previousStepLoanProducts() {
    this.configurationWizardService.showLoanProducts = false;
    this.configurationWizardService.showChargesList = true;
    this.router.navigate(['/products/charges']);
  }

  nextStepSavingsProducts() {
    this.configurationWizardService.showSavingsProducts = false;
    this.configurationWizardService.showSavingsProductsPage = true;
    this.router.navigate(['/products/saving-products']);
  }

  previousStepSavingsProducts() {
    this.configurationWizardService.showSavingsProducts = false;
    this.configurationWizardService.showLoanProductsList = true;
    this.router.navigate(['/products/loan-products']);
  }

  nextStepShareProducts() {
    this.configurationWizardService.showShareProducts = false;
    this.configurationWizardService.showShareProductsPage = true;
    this.router.navigate(['/products/share-products']);
  }

  previousStepShareProducts() {
    this.configurationWizardService.showShareProducts = false;
    this.configurationWizardService.showSavingsProductsList = true;
    this.router.navigate(['/products/saving-products']);
  }

  nextStepFixedDepositProducts() {
    this.configurationWizardService.showFixedDepositProducts = false;
    this.configurationWizardService.showFixedDepositProductsPage = true;
    this.router.navigate(['/products/fixed-deposit-products']);
  }

  previousStepFixedDepositProducts() {
    this.configurationWizardService.showFixedDepositProducts = false;
    this.configurationWizardService.showShareProductsList = true;
    this.router.navigate(['/products/share-products']);
  }

  nextStepRecurringDepositProducts() {
    this.configurationWizardService.showRecurringDepositProducts = false;
    this.configurationWizardService.showRecurringDepositProductsPage = true;
    this.router.navigate(['/products/recurring-deposit-products']);
  }

  previousStepRecurringDepositProducts() {
    this.configurationWizardService.showRecurringDepositProducts = false;
    this.configurationWizardService.showFixedDepositProductsList = true;
    this.router.navigate(['/products/fixed-deposit-products']);
  }
}
