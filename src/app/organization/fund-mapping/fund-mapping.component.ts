/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { OrganizationService } from '../organization.service';

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
  fundMappingForm: FormGroup;
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
   * @param {Router} router Router for navigation.
   * @param {DatePipe} datePipe Date Pipe to format date.
   */
  constructor(private formBuilder: FormBuilder,
              private organizationService: OrganizationService,
              private route: ActivatedRoute,
              private datePipe: DatePipe) {
    this.route.data.subscribe((data: { advanceSearchTemplate: any }) => {
      this.advanceSearchTemplate = data.advanceSearchTemplate;
    });
  }

  ngOnInit() {
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
        this.fundMappingForm.addControl('outStandingAmountPercentageCondition', new FormControl('', Validators.required));
        this.fundMappingForm.get('outStandingAmountPercentageCondition').valueChanges.subscribe((_value: string) => {
          if (_value === 'between') {
            this.fundMappingForm.addControl('minOutStandingAmountPercentage', new FormControl('', Validators.required));
            this.fundMappingForm.addControl('maxOutStandingAmountPercentage', new FormControl('', Validators.required));
            this.fundMappingForm.removeControl('outStandingAmountPercentage');
          } else {
            this.fundMappingForm.addControl('outStandingAmountPercentage', new FormControl('', Validators.required));
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
        this.fundMappingForm.addControl('outstandingAmountCondition', new FormControl('', Validators.required));
        this.fundMappingForm.get('outstandingAmountCondition').valueChanges.subscribe((_value: string) => {
          if (_value === 'between') {
            this.fundMappingForm.addControl('minOutstandingAmount', new FormControl('', Validators.required));
            this.fundMappingForm.addControl('maxOutstandingAmount', new FormControl('', Validators.required));
            this.fundMappingForm.removeControl('outstandingAmount');
          } else {
            this.fundMappingForm.addControl('outstandingAmount', new FormControl('', Validators.required));
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
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'yyyy-MM-dd';
    this.fundMappingForm.patchValue({
      'loanFromDate': this.datePipe.transform(this.fundMappingForm.value.loanFromDate, dateFormat),
      'loanToDate': this.datePipe.transform(this.fundMappingForm.value.loanToDate, dateFormat)
    });
    const fundMapping = {
      ...this.fundMappingForm.value,
      entities: ['loans'],
      dateFormat,
      locale
    };
    this.organizationService.retrieveAdvanceSearchResults(fundMapping).subscribe((response: any) => {
      this.setLoans(response);
    });
  }

}
