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
 * Create Adhoc Query component.
 */
@Component({
  selector: 'mifosx-create-adhoc-query',
  templateUrl: './create-adhoc-query.component.html',
  styleUrls: ['./create-adhoc-query.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateAdhocQueryComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private organizationService = inject(OrganizationService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Adhoc Query form. */
  adhocQueryForm: FormGroup;
  /** Adhoc Query template data. */
  adhocQueryTemplateData: any;
  /** Report run frequencies data. */
  reportRunFrequencyData: any;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { adhocQueryTemplate: any }) => {
      this.adhocQueryTemplateData = data.adhocQueryTemplate;
    });
  }

  /**
   * Creates the adhoc query form and sets the conditional controls of the adhoc query form.
   */
  ngOnInit() {
    this.createAdhocQueryForm();
    this.setConditionalControls();
  }

  /**
   * Creates the adhoc query form.
   */
  createAdhocQueryForm() {
    this.reportRunFrequencyData = this.adhocQueryTemplateData.reportRunFrequencies;
    this.adhocQueryForm = this.formBuilder.group({
      name: [
        '',
        Validators.required
      ],
      query: [
        '',
        Validators.required
      ],
      tableName: [
        '',
        Validators.required
      ],
      tableFields: [
        '',
        Validators.required
      ],
      email: [
        '',
        Validators.email
      ],
      reportRunFrequency: [''],
      isActive: [false]
    });
  }

  /**
   * Sets the conditional controls of the adhoc query form
   */
  setConditionalControls() {
    this.adhocQueryForm
      .get('reportRunFrequency')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reportRunFrequencyId) => {
        if (reportRunFrequencyId === 5) {
          this.adhocQueryForm.addControl(
            'reportRunEvery',
            new FormControl('', [
              Validators.required,
              Validators.min(1)
            ])
          );
        } else {
          this.adhocQueryForm.removeControl('reportRunEvery');
        }
      });
  }

  /**
   * Submits the adhoc query form and creates adhoc query,
   * if successful redirects to view adhoc query.
   */
  submit() {
    this.organizationService
      .createAdhocQuery(this.adhocQueryForm.value)
      .pipe(take(1))
      .subscribe((response: any) => {
        this.router.navigate(
          [
            '../',
            response.resourceId
          ],
          { relativeTo: this.route }
        );
      });
  }
}
