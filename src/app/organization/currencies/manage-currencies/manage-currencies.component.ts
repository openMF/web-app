/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormBuilder, Validators } from '@angular/forms';

/** Custom Dialogs */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../../configuration-wizard/configuration-wizard.service';

/** Custom Dialog Component */
import { ContinueSetupDialogComponent } from '../../../configuration-wizard/continue-setup-dialog/continue-setup-dialog.component';

/**
 * Manage Currencies component.
 */
@Component({
  selector: 'mifosx-manage-currencies',
  templateUrl: './manage-currencies.component.html',
  styleUrls: ['./manage-currencies.component.scss']
})
export class ManageCurrenciesComponent implements OnInit, AfterViewInit {

  /** Selected Currencies data. */
  selectedCurrencies: any[];
  /** Currency options data */
  currencyData: any;
  /** Currency form */
  currencyForm: any;

  /** Currency form reference */
  @ViewChild('formRef', { static: true }) formRef: any;
  @ViewChild('currencyFormRef') currencyFormRef: ElementRef<any>;
  @ViewChild('templateCurrencyFormRef') templateCurrencyFormRef: TemplateRef<any>;

  /**
   * Retrieves the currency data from `resolve`.
   * @param {ActivatedRoute} route Activated Route
   * @param {FormBuilder} formBuilder Form Builder
   * @param {OrganizationService} organizationservice Organization Service
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(private route: ActivatedRoute,
              private formBuilder: UntypedFormBuilder,
              private organizationservice: OrganizationService,
              public dialog: MatDialog,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.parent.data.subscribe(( data: { currencies: any }) => {
      this.selectedCurrencies = data.currencies.selectedCurrencyOptions;
      this.currencyData = data.currencies.currencyOptions;
    });
  }

  ngOnInit() {
    this.createCurrencyForm();
  }

  /**
   * Creates the currency form.
   */
  createCurrencyForm() {
    this.currencyForm = this.formBuilder.group({
      'currency': ['', Validators.required]
    });
  }

  /**
   * Adds a new currency to the list.
   */
  addCurrency() {
    const newCurrency = this.currencyForm.value.currency;
    const selectedCurrencyCodes: any[] = this.selectedCurrencies.map(currency => currency.code);
    if (!selectedCurrencyCodes.includes(newCurrency.code)) {
      selectedCurrencyCodes.push(newCurrency.code);
      this.organizationservice.updateCurrencies(selectedCurrencyCodes)
        .subscribe((response: any) => {
          this.selectedCurrencies.push(newCurrency);
          this.formRef.resetForm();
          if (this.configurationWizardService.showCurrencyForm === true) {
            this.configurationWizardService.showCurrencyForm = false;
            this.openDialog();
          }
        });
    }
  }

  /**
   * Deletes Currency
   * @param {string} currencyCode Currency Code
   * @param {number} index Index
   */
  deleteCurrency(currencyCode: string, index: number) {
    const selectedCurrencyCodes: any[] = this.selectedCurrencies.map(currency => currency.code);
    selectedCurrencyCodes.splice(index, 1);
    const deleteCurrencyDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `currency: ${currencyCode}` }
    });
    deleteCurrencyDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationservice.updateCurrencies(selectedCurrencyCodes)
          .subscribe(() => {
            this.selectedCurrencies.splice(index, 1);
            this.formRef.resetForm();
          });
      }
    });
  }

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  ngAfterViewInit() {
    if (this.configurationWizardService.showCurrencyForm === true) {
      setTimeout(() => {
          this.showPopover(this.templateCurrencyFormRef, this.currencyFormRef.nativeElement, 'bottom', true);
      });
    }
  }

  nextStep() {
    this.configurationWizardService.showCurrencyForm = false;
    this.configurationWizardService.showCreateHoliday = true;
    this.router.navigate(['/organization']);
  }

  previousStep() {
    this.configurationWizardService.showCurrencyForm = false;
    this.configurationWizardService.showCurrencyList = true;
    this.router.navigate(['/organization/currencies']);
  }

  openDialog() {
    const continueSetupDialogRef = this.dialog.open(ContinueSetupDialogComponent, {
      data: {
        stepName: 'currency'
      },
    });
    continueSetupDialogRef.afterClosed().subscribe((response: { step: number }) => {
    if (response.step === 1) {
        this.configurationWizardService.showCurrencyForm = false;
        this.router.navigate(['../'], { relativeTo: this.route });
      } else if (response.step === 2) {
        this.configurationWizardService.showCurrencyForm = true;
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate(['/organization/currencies/manage']);
      } else if (response.step === 3) {
        this.configurationWizardService.showCurrencyForm = false;
        this.configurationWizardService.showCreateHoliday = true;
        this.router.navigate(['/organization']);
      }
    });
  }
}
