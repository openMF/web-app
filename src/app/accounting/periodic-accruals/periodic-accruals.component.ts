/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../accounting.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../directives/has-permission/has-permission.directive';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
/**
 * Periodic accruals component.
 */
@Component({
  selector: 'mifosx-periodic-accruals',
  templateUrl: './periodic-accruals.component.html',
  styleUrls: ['./periodic-accruals.component.scss'],
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
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    FaIconComponent,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class PeriodicAccrualsComponent implements OnInit {
  /** Minimum accrue date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum accrue date allowed. */
  maxDate = new Date();
  /** Periodic accruals form. */
  periodicAccrualsForm: UntypedFormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private accountingService: AccountingService,
    private settingsService: SettingsService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * Creates periodic accruals form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createPeriodicAccrualsForm();
  }

  /**
   * Creates periodic accruals form.
   */
  createPeriodicAccrualsForm() {
    this.periodicAccrualsForm = this.formBuilder.group({
      tillDate: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Submits the periodic accruals form and executes periodic accruals,
   * if successful redirects to accounting.
   */
  submit() {
    const periodicAccruals = this.periodicAccrualsForm.value;
    // TODO: Update once language and date settings are setup
    periodicAccruals.locale = this.settingsService.language.code;
    periodicAccruals.dateFormat = this.settingsService.dateFormat;
    if (periodicAccruals.tillDate instanceof Date) {
      periodicAccruals.tillDate = this.dateUtils.formatDate(periodicAccruals.tillDate, this.settingsService.dateFormat);
    }
    this.accountingService.executePeriodicAccruals(periodicAccruals).subscribe(() => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
