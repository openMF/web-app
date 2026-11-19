/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Dates } from 'app/core/utils/dates';
import { Datatables } from 'app/core/utils/datatables';
import { SettingsService } from 'app/settings/settings.service';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanFormSection } from 'app/loans/loan-form/loan-form.model';
import { sectionFromDatatable, toDatatablePayload } from 'app/loans/loan-form/loan-form';
import { LoanFormSectionComponent } from 'app/loans/loan-form/loan-form-section/loan-form-section.component';

/** One datatable the loan product requires on submission, as a section of the application. */
@Component({
  selector: 'mifosx-loans-account-datatable-step',
  templateUrl: './loans-account-datatable-step.component.html',
  styleUrls: ['./loans-account-datatable-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    LoanFormSectionComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoansAccountDatatableStepComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private dateUtils = inject(Dates);
  private datatables = inject(Datatables);

  /** A datatable from the loan template's `datatables[]`. */
  @Input() datatableData: any;
  @ViewChild(LoanFormSectionComponent, { static: true }) sectionForm: LoanFormSectionComponent;

  section: LoanFormSection;

  ngOnInit(): void {
    this.section = sectionFromDatatable(this.datatableData, (name) => this.datatables.toDisplayLabel(name));
  }

  get form(): FormGroup {
    return this.sectionForm?.form;
  }

  get payload(): any {
    return toDatatablePayload(this.section, this.form, {
      locale: this.settingsService.language.code,
      dateFormat: this.settingsService.dateFormat,
      dateTimeFormat: Dates.DEFAULT_DATETIMEFORMAT,
      formatDate: (value, format) => this.dateUtils.formatDate(value, format)
    });
  }
}
