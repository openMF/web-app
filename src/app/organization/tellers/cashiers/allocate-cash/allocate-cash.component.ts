/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgIf, NgFor } from '@angular/common';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Allocate Cash component.
 */
@Component({
  selector: 'mifosx-allocate-cash',
  templateUrl: './allocate-cash.component.html',
  styleUrls: ['./allocate-cash.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    NgIf,
    MatError,
    MatSelect,
    NgFor,
    MatOption,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class AllocateCashComponent implements OnInit {
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Cashier data. */
  cashierData: any;
  /** Cashier Form. */
  allocateCashForm: UntypedFormGroup;

  /**
   * Get cashier data from `Resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route ActivateRoute.
   * @param {Dates} dateUtils Date Utils.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {Router} router Router.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private dateUtils: Dates,
    private organizationService: OrganizationService,
    private settingsService: SettingsService,
    private router: Router
  ) {
    this.route.data.subscribe((data: { cashierTemplate: any }) => {
      this.cashierData = data.cashierTemplate;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.setCashierForm();
  }

  /**
   * Set Cashier form.
   */
  setCashierForm() {
    this.allocateCashForm = this.formBuilder.group({
      office: [{ value: this.cashierData.officeName, disabled: true }],
      tellerName: [{ value: this.cashierData.tellerName, disabled: true }],
      cashier: [{ value: this.cashierData.cashierName, disabled: true }],
      assignmentPeriod: [
        {
          value:
            this.dateUtils.formatDate(this.cashierData.startDate, 'dd MMMM yyyy') +
            ' - ' +
            this.dateUtils.formatDate(this.cashierData.endDate, 'dd MMMM yyyy'),
          disabled: true
        }
      ],
      txnDate: [
        new Date(),
        Validators.required
      ],
      currencyCode: [
        '',
        Validators.required
      ],
      txnAmount: [
        '',
        Validators.required
      ],
      txnNote: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Submits Allocate Cash form.
   */
  submit() {
    const allocateCashFormData = this.allocateCashForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const txnDate = this.allocateCashForm.value.txnDate;
    if (allocateCashFormData.txnDate instanceof Date) {
      allocateCashFormData.txnDate = this.dateUtils.formatDate(txnDate, dateFormat);
    }
    const data = {
      ...allocateCashFormData,
      dateFormat,
      locale
    };
    this.organizationService
      .allocateCash(this.cashierData.tellerId, this.cashierData.cashierId, data)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
