/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * View Standing Instructions History Component.
 */
@Component({
  selector: 'mifosx-standing-instructions-history',
  templateUrl: './standing-instructions-history.component.html',
  styleUrls: ['./standing-instructions-history.component.scss']
})
export class StandingInstructionsHistoryComponent implements OnInit {

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Instruction  form. */
  instructionForm: FormGroup;
  /** Standing Instructions Template */
  standingInstructionsTemplate: any;
  /** Toggles b/w form and table */
  isCollapsed = false;

  /** Columns to be displayed in instructions table. */
  displayedColumns: string[] = ['fromClient', 'fromAccount', 'toClient', 'toAccount', 'executionTime', 'amount', 'status', 'errorLog'];
  /** Data source for instructions table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for instructions table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for instructions table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the instructions template from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {Dates} dateUtils Date Utils to format date.
   */
  constructor(private formBuilder: FormBuilder,
              private organizationService: OrganizationService,
              private settingsService: SettingsService,
              private router: Router,
              private route: ActivatedRoute,
              private dateUtils: Dates) {
    this.route.data.subscribe((data: { standingInstructionsTemplate: any }) => {
      this.standingInstructionsTemplate = data.standingInstructionsTemplate;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createInstructionForm();
    this.buildDependencies();
  }

  /**
   * Creates the Instruction Form
   */
  createInstructionForm() {
    this.instructionForm = this.formBuilder.group({
      'clientName': [''],
      'clientId': [''],
      'transferType': [''],
      'fromAccountType': [''],
      'fromDate': [''],
      'toDate': ['']
    });
  }

  /**
   * Sets conditional child controls.
   */
  buildDependencies() {
    this.instructionForm.get('fromAccountType').valueChanges.subscribe(() => {
      this.instructionForm.addControl('fromAccountId', new FormControl(''));
    });
  }

  /**
   * Initializes the data source, paginator and sorter for instructions table.
   * @param {any} data
   */
  setInstructions(data: any) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Searches standing instructions.
   */
  search() {
    this.isCollapsed = true;
    const instructionFormData = this.instructionForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevFromDate: Date = this.instructionForm.value.fromDate;
    const prevToDate: Date = this.instructionForm.value.toDate;
    if (instructionFormData.fromDate instanceof Date) {
      instructionFormData.fromDate = this.dateUtils.formatDate(prevFromDate, dateFormat);
    }
    if (instructionFormData.toDate instanceof Date) {
      instructionFormData.toDate = this.dateUtils.formatDate(prevToDate, dateFormat);
    }
    const data = {
      ...instructionFormData,
      dateFormat,
      locale
    };
    this.organizationService.getStandingInstructions(data).subscribe((response: any) => {
      this.setInstructions(response.pageItems);
    });
  }

}
