/** Angular Imports */
import {
  Component,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

/** Custom Dialogs */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../../configuration-wizard/configuration-wizard.service';

/** Custom Dialog Component */
import { ContinueSetupDialogComponent } from '../../../configuration-wizard/continue-setup-dialog/continue-setup-dialog.component';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject, Subject } from 'rxjs';
import { Currency } from 'app/shared/models/general.model';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Manage Currencies component.
 */
@Component({
  selector: 'mifosx-manage-currencies',
  templateUrl: './manage-currencies.component.html',
  styleUrls: ['./manage-currencies.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NgxMatSelectSearchModule,
    FaIconComponent,
    MatGridList,
    MatGridTile,
    AsyncPipe
  ]
})
export class ManageCurrenciesComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  //** Defining PlaceHolders for the search bar */
  placeHolderLabel = '';
  noEntriesFoundLabel = '';
  /** Selected Currencies data. */
  selectedCurrencies: any[];
  /** Currency options data */
  currencyList: Currency[] = [];
  /** Currency form */
  currencyForm: any;

  /** Currency form reference */
  @ViewChild('formRef', { static: true }) formRef: any;
  @ViewChild('currencyFormRef') currencyFormRef: ElementRef<any>;
  @ViewChild('templateCurrencyFormRef') templateCurrencyFormRef: TemplateRef<any>;

  /** Currency data. */
  protected currencyData: ReplaySubject<Currency[]> = new ReplaySubject<Currency[]>(1);

  /** control for the filter select */
  protected filterFormCtrl: UntypedFormControl = new UntypedFormControl('');

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  /**
   * Retrieves the currency data from `resolve`.
   * @param {ActivatedRoute} route Activated Route
   * @param {FormBuilder} formBuilder Form Builder
   * @param {OrganizationService} organizationservice Organization Service
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private organizationservice: OrganizationService,
    public dialog: MatDialog,
    private router: Router,
    private translateService: TranslateService,
    private configurationWizardService: ConfigurationWizardService,
    private popoverService: PopoverService
  ) {
    this.route.parent.data.subscribe((data: { currencies: any }) => {
      this.selectedCurrencies = data.currencies.selectedCurrencyOptions;
      this.currencyList = data.currencies.currencyOptions;
    });
  }

  ngOnInit() {
    this.placeHolderLabel = this.translateService.instant('labels.text.Search');
    this.noEntriesFoundLabel = this.translateService.instant('labels.text.No data found');
    this.filterFormCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.searchItem();
    });
    this.createCurrencyForm();
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.currencyList) {
      this.currencyData.next(this.currencyList.slice());
    }
  }

  /**
   * Creates the currency form.
   */
  createCurrencyForm() {
    this.currencyForm = this.formBuilder.group({
      currency: [
        '',
        Validators.required
      ]
    });
  }

  searchItem(): void {
    if (this.currencyList) {
      const search: string = this.filterFormCtrl.value.toLowerCase();

      if (!search) {
        this.currencyData.next(this.currencyList.slice());
      } else {
        this.currencyData.next(
          this.currencyList.filter((option: Currency) => {
            return option.name.toLowerCase().indexOf(search) >= 0 || option.code.toLowerCase().indexOf(search) >= 0;
          })
        );
      }
    }
  }

  /**
   * Adds a new currency to the list.
   */
  addCurrency() {
    const newCurrency = this.currencyForm.value.currency;
    const selectedCurrencyCodes: any[] = this.selectedCurrencies.map((currency) => currency.code);
    if (!selectedCurrencyCodes.includes(newCurrency.code)) {
      selectedCurrencyCodes.push(newCurrency.code);
      this.organizationservice.updateCurrencies(selectedCurrencyCodes).subscribe((response: any) => {
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
    const selectedCurrencyCodes: any[] = this.selectedCurrencies.map((currency) => currency.code);
    selectedCurrencyCodes.splice(index, 1);
    const deleteCurrencyDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `currency: ${currencyCode}` }
    });
    deleteCurrencyDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationservice.updateCurrencies(selectedCurrencyCodes).subscribe(() => {
          this.selectedCurrencies.splice(index, 1);
          this.formRef.resetForm();
        });
      }
    });
  }

  showPopover(
    template: TemplateRef<any>,
    target: HTMLElement | ElementRef<any>,
    position: string,
    backdrop: boolean
  ): void {
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
      }
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
