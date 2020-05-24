/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Create Entity Data Table Checks component.
 */
@Component({
  selector: 'mifosx-create-enity-data-table-checks',
  templateUrl: './create-enity-data-table-checks.component.html',
  styleUrls: ['./create-enity-data-table-checks.component.scss']
})
export class CreateEnityDataTableChecksComponent implements OnInit {

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

  /**
   * Retrieves Entity Datatable Checks data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {Router} router Router.
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private organizationService: OrganizationService,
              private router: Router) {
    this.route.data.subscribe((data: {dataTableEntity: any}) => {
      this.createEntityData = data.dataTableEntity;
      this.entityTypes = [
        { name: 'Client', value: this.createEntityData.entities[0] },
        { name: 'Loan', value: this.createEntityData.entities[1] },
        { name: 'Group', value: this.createEntityData.entities[2] },
        { name: 'Savings Account', value: this.createEntityData.entities[3] }
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
      'entity': ['', Validators.required],
      'status': ['', Validators.required],
      'datatableName': ['', Validators.required]
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
        default : {
          this.entityType = 'm_savings_account';
          this.dataTableList = this.createEntityData.datatables.filter((data: any) => data.entity === 'm_savings_account');
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
    this.organizationService.createEntityDataTableChecks(this.createEntityForm.value).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
