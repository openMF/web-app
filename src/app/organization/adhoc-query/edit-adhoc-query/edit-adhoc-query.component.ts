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
import { FormGroup, FormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Edit Adhoc Query component.
 */
@Component({
  selector: 'mifosx-edit-adhoc-query',
  templateUrl: './edit-adhoc-query.component.html',
  styleUrls: ['./edit-adhoc-query.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAdhocQueryComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private organizationService = inject(OrganizationService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Edit Adhoc Query form. */
  editAdhocQueryForm: FormGroup;
  /** Adhoc Query template data. */
  adhocQueryTemplateData: any;
  /** Report run frequencies data. */
  reportRunFrequencyData: any;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { adhocQueryAndTemplate: any }) => {
      this.adhocQueryTemplateData = data.adhocQueryAndTemplate;
    });
  }

  /**
   * Creates the edit adhoc query form and sets the conditional controls of the adhoc query form.
   */
  ngOnInit() {
    this.createEditAdhocQueryForm();
    this.setConditionalControls();
  }

  /**
   * Creates the edit adhoc query form.
   */
  createEditAdhocQueryForm() {
    this.reportRunFrequencyData = this.adhocQueryTemplateData.reportRunFrequencies;
    this.editAdhocQueryForm = this.formBuilder.group({
      name: [
        this.adhocQueryTemplateData.name,
        Validators.required
      ],
      query: [
        this.adhocQueryTemplateData.query,
        Validators.required
      ],
      tableName: [
        this.adhocQueryTemplateData.tableName,
        Validators.required
      ],
      tableFields: [
        this.adhocQueryTemplateData.tableFields,
        Validators.required
      ],
      email: [
        this.adhocQueryTemplateData.email,
        Validators.email
      ],
      reportRunFrequency: [''],
      isActive: [this.adhocQueryTemplateData.isActive]
    });
  }

  /**
   * Sets the conditional controls of the adhoc query form
   */
  setConditionalControls() {
    this.editAdhocQueryForm
      .get('reportRunFrequency')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reportRunFrequencyId) => {
        if (reportRunFrequencyId === 5) {
          this.editAdhocQueryForm.addControl(
            'reportRunEvery',
            new FormControl('', [
              Validators.required,
              Validators.min(1)
            ])
          );
          this.editAdhocQueryForm.get('reportRunEvery').patchValue(this.adhocQueryTemplateData.reportRunEvery);
        } else {
          this.editAdhocQueryForm.removeControl('reportRunEvery');
        }
      });
    this.editAdhocQueryForm.get('reportRunFrequency').patchValue(this.adhocQueryTemplateData.reportRunFrequency);
  }

  /**
   * Submits the adhoc query form and updates adhoc query,
   * if successful redirects to view adhoc query.
   */
  submit() {
    this.organizationService
      .updateAdhocQuery(this.adhocQueryTemplateData.id, this.editAdhocQueryForm.value)
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
