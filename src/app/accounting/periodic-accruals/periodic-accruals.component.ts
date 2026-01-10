/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../accounting.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
/**
 * Periodic accruals component.
 */
@Component({
  selector: 'mifosx-periodic-accruals',
  templateUrl: './periodic-accruals.component.html',
  styleUrls: ['./periodic-accruals.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ]
})
export class PeriodicAccrualsComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private accountingService = inject(AccountingService);
  private settingsService = inject(SettingsService);
  private dateUtils = inject(Dates);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Minimum accrue date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum accrue date allowed. */
  maxDate = new Date();
  /** Periodic accruals form. */
  periodicAccrualsForm: UntypedFormGroup;

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
