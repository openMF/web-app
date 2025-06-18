/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Create Cashier component.
 */
@Component({
  selector: 'mifosx-create-cashier',
  templateUrl: './create-cashier.component.html',
  styleUrls: ['./create-cashier.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    NgFor,
    MatOption,
    NgIf,
    MatError,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatCheckbox,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class CreateCashierComponent implements OnInit {
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Cashier Template. */
  cashierTemplate: any;
  /** Create cashier form. */
  createCashierForm: UntypedFormGroup;

  /**
   * Fetches cashier template from `resolve`
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router.
   * @param {Dates} dateUtils Date Utils.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private organizationService: OrganizationService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { cashierTemplate: any }) => {
      this.cashierTemplate = data.cashierTemplate;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
    this.setCreateCashierForm();
  }

  /**
   * Sets Create Charge Form.
   */
  setCreateCashierForm() {
    this.createCashierForm = this.formBuilder.group({
      staffId: [
        '',
        Validators.required
      ],
      description: [''],
      startDate: [
        '',
        Validators.required
      ],
      endDate: [
        '',
        Validators.required
      ],
      isFullDay: [false]
    });
  }

  /**
   * Submits Create cashier form.
   */
  submit() {
    const createCashierFormData = this.createCashierForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevStartDate: Date = this.createCashierForm.value.startDate;
    const prevEndDate: Date = this.createCashierForm.value.endDate;
    if (createCashierFormData.startDate instanceof Date) {
      createCashierFormData.startDate = this.dateUtils.formatDate(prevStartDate, dateFormat);
    }
    if (createCashierFormData.endDate instanceof Date) {
      createCashierFormData.endDate = this.dateUtils.formatDate(prevEndDate, dateFormat);
    }
    const data = {
      ...createCashierFormData,
      dateFormat,
      locale
    };
    this.organizationService.createCashier(this.cashierTemplate.tellerId, data).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
