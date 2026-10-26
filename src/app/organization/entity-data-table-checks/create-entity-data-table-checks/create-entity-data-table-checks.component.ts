/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports. */
import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create Entity Data Table Checks component.
 */
@Component({
  selector: 'mifosx-create-entity-data-table-checks',
  templateUrl: './create-entity-data-table-checks.component.html',
  styleUrls: ['./create-entity-data-table-checks.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateEntityDataTableChecksComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private organizationService = inject(OrganizationService);
  private router = inject(Router);

  /** Create Entity Datatable Checks form. */
  createEntityForm: FormGroup;
  /** Entity Datatable Checks data. */
  createEntityData: any;
  /** Selected entity type. */
  entityType: string;
  /** Entity types object array. */
  entityTypes: any[];
  /** Datatable Checks list. */
  dataTableList: any[];
  /** Loan and Savings status list. */
  statusList: any[];

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { dataTableEntity: any }) => {
      this.createEntityData = data.dataTableEntity;
      // hardcoded, because data.dataTableEntity.entities might change anytime its order
      this.entityTypes = [
        { name: 'Client', value: 'm_client' },
        { name: 'Loan', value: 'm_loan' },
        { name: 'Group', value: 'm_group' },
        { name: 'Savings Account', value: 'm_savings_account' }
      ];
    });
  }

  ngOnInit() {
    this.setCreateEntityDataTableForm();
    this.getEntityType();
  }

  /**
   * Sets Entity Data Table Form.
   */
  setCreateEntityDataTableForm() {
    this.createEntityForm = this.formBuilder.group({
      entity: [
        '',
        Validators.required
      ],
      status: [
        '',
        Validators.required
      ],
      datatableName: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Get Entity on selection.
   * @param entity Selected Entity.
   */
  getEntityType() {
    this.createEntityForm
      .get('entity')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((option: any) => {
        switch (option) {
          case 'm_client': {
            this.entityType = 'm_client';
            this.dataTableList = this.createEntityData.datatables.filter((data: any) => data.entity === 'm_client');
            this.statusList = this.createEntityData.statusClient;
            this.createEntityForm.removeControl('productId');
            break;
          }
          case 'm_loan': {
            this.entityType = 'm_loan';
            this.dataTableList = this.createEntityData.datatables.filter((data: any) => data.entity === 'm_loan');
            this.statusList = this.createEntityData.statusLoans;
            this.createEntityForm.addControl('productId', new FormControl('', Validators.required));
            break;
          }
          case 'm_group': {
            this.entityType = 'm_group';
            this.dataTableList = this.createEntityData.datatables.filter((data: any) => data.entity === 'm_group');
            this.statusList = this.createEntityData.statusGroup;
            this.createEntityForm.removeControl('productId');
            break;
          }
          default: {
            this.entityType = 'm_savings_account';
            this.dataTableList = this.createEntityData.datatables.filter(
              (data: any) => data.entity === 'm_savings_account'
            );
            this.statusList = this.createEntityData.statusSavings;
            this.createEntityForm.addControl('productId', new FormControl('', Validators.required));
            break;
          }
        }
      });
  }

  /**
   * Submits Entity Datble Form.
   */
  submit() {
    this.organizationService
      .createEntityDataTableChecks(this.createEntityForm.value)
      .pipe(take(1))
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
