/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCheckbox } from '@angular/material/checkbox';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Fund Mapping Component.
 */
@Component({
  selector: 'mifosx-fund-mapping',
  templateUrl: './fund-mapping.component.html',
  styleUrls: ['./fund-mapping.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ]
})
export class FundMappingComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private organizationService = inject(OrganizationService);
  private settingsService = inject(SettingsService);
  private route = inject(ActivatedRoute);
  private dateUtils = inject(Dates);

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Fund mapping form. */
  fundMappingForm: UntypedFormGroup;
  /** Advance Search Template */
  advanceSearchTemplate: any;
  /** Toggles b/w form and table */
  isCollapsed = false;

  /** Columns to be displayed in loans table. */
  displayedColumns: string[] = [
    'officeName',
    'productName',
    'count',
    'outstanding',
    'percentage'
  ];
  /** Data source for loans table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for loans table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for loans table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the advance search template from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {Router} router Router for navigation.
   * @param {Dates} dateUtils Date Utils to format date.
   */
  constructor() {
    this.route.data.subscribe((data: { advanceSearchTemplate: any }) => {
      this.advanceSearchTemplate = data.advanceSearchTemplate;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createFundMappingForm();
    this.buildDependencies();
  }

  /**
   * Creates the Fund Mapping Form
   */
  createFundMappingForm() {
    this.fundMappingForm = this.formBuilder.group({
      loanStatus: [[]],
      loanProducts: [[]],
      offices: [[]],
      loanDateOption: [
        '',
        Validators.required
      ],
      loanFromDate: [
        '',
        Validators.required
      ],
      loanToDate: [
        '',
        Validators.required
      ],
      includeOutStandingAmountPercentage: [false],
      includeOutstandingAmount: [false]
    });
  }

  /**
   * Sets conditional child controls.
   */
  buildDependencies() {
    this.fundMappingForm.get('includeOutStandingAmountPercentage').valueChanges.subscribe((value: boolean) => {
      if (value) {
        this.fundMappingForm.addControl(
          'outStandingAmountPercentageCondition',
          new UntypedFormControl('', Validators.required)
        );
        this.fundMappingForm.get('outStandingAmountPercentageCondition').valueChanges.subscribe((_value: string) => {
          if (_value === 'between') {
            this.fundMappingForm.addControl(
              'minOutStandingAmountPercentage',
              new UntypedFormControl('', [
                Validators.required,
                Validators.min(0)
              ])
            );
            this.fundMappingForm.addControl(
              'maxOutStandingAmountPercentage',
              new UntypedFormControl('', [
                Validators.required,
                Validators.min(0)
              ])
            );
            this.fundMappingForm.removeControl('outStandingAmountPercentage');
          } else {
            this.fundMappingForm.addControl(
              'outStandingAmountPercentage',
              new UntypedFormControl('', [
                Validators.required,
                Validators.min(0)
              ])
            );
            this.fundMappingForm.removeControl('minOutStandingAmountPercentage');
            this.fundMappingForm.removeControl('maxOutStandingAmountPercentage');
          }
        });
        this.fundMappingForm.get('outStandingAmountPercentageCondition').patchValue('between');
      } else {
        this.fundMappingForm.removeControl('outStandingAmountPercentageCondition');
        this.fundMappingForm.removeControl('minOutStandingAmountPercentage');
        this.fundMappingForm.removeControl('maxOutStandingAmountPercentage');
        this.fundMappingForm.removeControl('outStandingAmountPercentage');
      }
    });
    this.fundMappingForm.get('includeOutStandingAmountPercentage').patchValue(true);
    this.fundMappingForm.get('includeOutstandingAmount').valueChanges.subscribe((value: boolean) => {
      if (value) {
        this.fundMappingForm.addControl('outstandingAmountCondition', new UntypedFormControl('', Validators.required));
        this.fundMappingForm.get('outstandingAmountCondition').valueChanges.subscribe((_value: string) => {
          if (_value === 'between') {
            this.fundMappingForm.addControl(
              'minOutstandingAmount',
              new UntypedFormControl('', [
                Validators.required,
                Validators.min(0)
              ])
            );
            this.fundMappingForm.addControl(
              'maxOutstandingAmount',
              new UntypedFormControl('', [
                Validators.required,
                Validators.min(0)
              ])
            );
            this.fundMappingForm.removeControl('outstandingAmount');
          } else {
            this.fundMappingForm.addControl(
              'outstandingAmount',
              new UntypedFormControl('', [
                Validators.required,
                Validators.min(0)
              ])
            );
            this.fundMappingForm.removeControl('minOutstandingAmount');
            this.fundMappingForm.removeControl('maxOutstandingAmount');
          }
        });
        this.fundMappingForm.get('outstandingAmountCondition').patchValue('between');
      } else {
        this.fundMappingForm.removeControl('outstandingAmountCondition');
        this.fundMappingForm.removeControl('minOutstandingAmount');
        this.fundMappingForm.removeControl('maxOutstandingAmount');
        this.fundMappingForm.removeControl('outstandingAmount');
      }
    });
    this.fundMappingForm.get('includeOutstandingAmount').patchValue(true);
  }

  /**
   * Initializes the data source, paginator and sorter for loans table.
   * @param {any} data
   */
  setLoans(data: any) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Searches standing loans.
   */
  submit() {
    this.isCollapsed = true;
    const fundMappingFormData = this.fundMappingForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevLoanFromDate: Date = this.fundMappingForm.value.loanFromDate;
    const prevLoanToDate: Date = this.fundMappingForm.value.loanToDate;
    if (fundMappingFormData.loanFromDate instanceof Date) {
      fundMappingFormData.loanFromDate = this.dateUtils.formatDate(prevLoanFromDate, dateFormat);
    }
    if (this.fundMappingForm.invalid) {
      this.fundMappingForm.markAllAsTouched();
      return;
    }
    if (fundMappingFormData.loanToDate instanceof Date) {
      fundMappingFormData.loanToDate = this.dateUtils.formatDate(prevLoanToDate, dateFormat);
    }
    const data = {
      ...fundMappingFormData,
      entities: ['loans'],
      dateFormat,
      locale
    };
    this.organizationService.retrieveAdvanceSearchResults(data).subscribe((response: any) => {
      this.setLoans(response);
    });
  }
}
