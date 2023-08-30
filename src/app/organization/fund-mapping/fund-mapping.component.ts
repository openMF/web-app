/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Fund Mapping Component.
 */
@Component({
  selector: 'mifosx-fund-mapping',
  templateUrl: './fund-mapping.component.html',
  styleUrls: ['./fund-mapping.component.scss']
})
export class FundMappingComponent implements OnInit {

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
  displayedColumns: string[] = ['officeName', 'productName', 'count', 'outstanding', 'percentage'];
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
  constructor(private formBuilder: UntypedFormBuilder,
              private organizationService: OrganizationService,
              private settingsService: SettingsService,
              private route: ActivatedRoute,
              private dateUtils: Dates) {
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
      'loanStatus': [''],
      'loanProducts': [''],
      'offices': [''],
      'loanDateOption': ['', Validators.required],
      'loanFromDate': ['', Validators.required],
      'loanToDate': ['', Validators.required],
      'includeOutStandingAmountPercentage': [false],
      'includeOutstandingAmount': [false]
    });
  }

  /**
   * Sets conditional child controls.
   */
  buildDependencies() {
    this.fundMappingForm.get('includeOutStandingAmountPercentage').valueChanges.subscribe((value: boolean) => {
      if (value) {
        this.fundMappingForm.addControl('outStandingAmountPercentageCondition', new UntypedFormControl('', Validators.required));
        this.fundMappingForm.get('outStandingAmountPercentageCondition').valueChanges.subscribe((_value: string) => {
          if (_value === 'between') {
            this.fundMappingForm.addControl('minOutStandingAmountPercentage', new UntypedFormControl('', Validators.required));
            this.fundMappingForm.addControl('maxOutStandingAmountPercentage', new UntypedFormControl('', Validators.required));
            this.fundMappingForm.removeControl('outStandingAmountPercentage');
          } else {
            this.fundMappingForm.addControl('outStandingAmountPercentage', new UntypedFormControl('', Validators.required));
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
            this.fundMappingForm.addControl('minOutstandingAmount', new UntypedFormControl('', Validators.required));
            this.fundMappingForm.addControl('maxOutstandingAmount', new UntypedFormControl('', Validators.required));
            this.fundMappingForm.removeControl('outstandingAmount');
          } else {
            this.fundMappingForm.addControl('outstandingAmount', new UntypedFormControl('', Validators.required));
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
