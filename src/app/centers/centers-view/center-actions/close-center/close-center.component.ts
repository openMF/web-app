/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { CentersService } from 'app/centers/centers.service';
import { Dates } from 'app/core/utils/dates';
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
 * Close Center Component
 */
@Component({
  selector: 'mifosx-close-center',
  templateUrl: './close-center.component.html',
  styleUrls: ['./close-center.component.scss'],
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
export class CloseCenterComponent implements OnInit {
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Close Share Account form. */
  closeCenterForm: UntypedFormGroup;
  /** Center Data */
  closureData: any;
  /** Center Id */
  centerId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {CentersService} centersService Shares Service
   * @param {SettingsService} settingsService Settings Service.
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private centersService: CentersService,
    private settingsService: SettingsService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { centeractionData: any }) => {
      this.closureData = data.centeractionData.closureReasons;
    });
    this.centerId = this.route.parent.snapshot.params['centerId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createCloseCenterForm();
  }

  /**
   * Creates the close centers form.
   */
  createCloseCenterForm() {
    this.closeCenterForm = this.formBuilder.group({
      closureDate: [
        '',
        Validators.required
      ],
      closureReasonId: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Submits the form and closes the center.
   */
  submit() {
    const closeCenterFormData = this.closeCenterForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevClosedDate: Date = this.closeCenterForm.value.closureDate;
    if (closeCenterFormData.closureDate instanceof Date) {
      closeCenterFormData.closureDate = this.dateUtils.formatDate(prevClosedDate, dateFormat);
    }
    const data = {
      ...closeCenterFormData,
      dateFormat,
      locale
    };
    this.centersService.executeCenterActionCommand(this.centerId, 'close', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }
}
