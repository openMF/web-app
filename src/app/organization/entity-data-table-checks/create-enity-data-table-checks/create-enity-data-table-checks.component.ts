/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services. */
import { EntityDataTableService } from '@fineract/client';
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
  ]
})
export class CreateEntityDataTableChecksComponent implements OnInit {
  /** Create Entity Datatable Checks form. */
  createEntityForm: UntypedFormGroup;
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

  /**
   * Retrieves Entity Datatable Checks data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {EntityDataTableService} entityDataTableService Entity Data Table Service.
   * @param {Router} router Router.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private entityDataTableService: EntityDataTableService,
    private router: Router
  ) {
    this.route.data.subscribe((data: { dataTableEntity: any }) => {
      this.createEntityData = data.dataTableEntity;
      this.entityTypes = [
        { name: 'Client', value: this.createEntityData.entityTypes[0] },
        { name: 'Loan', value: this.createEntityData.entityTypes[1] },
        { name: 'Group', value: this.createEntityData.entityTypes[2] },
        { name: 'Savings Account', value: this.createEntityData.entityTypes[3] }
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
    this.createEntityForm.get('entity').valueChanges.subscribe((option: any) => {
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
          this.createEntityForm.addControl('productId', new UntypedFormControl('', Validators.required));
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
          this.createEntityForm.addControl('productId', new UntypedFormControl('', Validators.required));
          break;
        }
      }
    });
  }

  /**
   * Submits Entity Datble Form.
   */
  submit() {
    this.entityDataTableService.createEntityDatatableCheck(this.createEntityForm.value).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
