/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-create-fund',
  templateUrl: './create-fund.component.html',
  styleUrls: ['./create-fund.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateFundComponent implements OnInit {
  private organizationService = inject(OrganizationService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** Charge form. */
  fundForm: FormGroup;

  ngOnInit() {
    this.createFundForm();
  }

  /**
   * Edit Fund form.
   */
  createFundForm() {
    this.fundForm = this.formBuilder.group({
      name: [
        '',
        Validators.required
      ],
      externalId: ['']
    });
  }

  submit() {
    const payload = this.fundForm.getRawValue();
    this.organizationService
      .createFund(payload)
      .pipe(take(1))
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
