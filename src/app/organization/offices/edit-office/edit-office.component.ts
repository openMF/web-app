/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Edit Office component.
 */
@Component({
  selector: 'mifosx-edit-office',
  templateUrl: './edit-office.component.html',
  styleUrls: ['./edit-office.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditOfficeComponent implements OnInit {
  private organizationService = inject(OrganizationService);
  private settingsService = inject(SettingsService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dateUtils = inject(Dates);

  /** Selected Data. */
  officeData: any;
  /** Office form. */
  officeForm: FormGroup;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { officeTemplate: any }) => {
      this.officeData = data.officeTemplate;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createOfficeForm();
  }

  /**
   * Create Edit Office Form.
   */
  createOfficeForm() {
    this.officeForm = this.formBuilder.group({
      name: [
        this.officeData.name,
        Validators.required
      ],
      openingDate: [
        this.officeData.openingDate && new Date(this.officeData.openingDate),
        Validators.required
      ],
      externalId: [this.officeData.externalId]
    });
    if (this.officeData.allowedParents.length) {
      this.officeForm.addControl('parentId', this.formBuilder.control(this.officeData.parentId, Validators.required));
    }
  }

  /**
   * Submits the edit office form.
   */
  submit() {
    const officeFormData = this.officeForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevOpenedOn: Date = this.officeForm.value.openingDate;
    if (officeFormData.openingDate instanceof Date) {
      officeFormData.openingDate = this.dateUtils.formatDate(prevOpenedOn, dateFormat);
    }
    const data = {
      ...officeFormData,
      dateFormat,
      locale
    };
    this.organizationService
      .updateOffice(this.officeData.id, data)
      .pipe(take(1))
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
