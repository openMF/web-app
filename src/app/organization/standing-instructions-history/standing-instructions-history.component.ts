/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { OrganizationService } from '../organization.service';

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
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {DatePipe} datePipe Date Pipe to format date.
   */
  constructor(private formBuilder: FormBuilder,
              private organizationService: OrganizationService,
              private router: Router,
              private route: ActivatedRoute,
              private datePipe: DatePipe) {
    this.route.data.subscribe((data: { standingInstructionsTemplate: any }) => {
      this.standingInstructionsTemplate = data.standingInstructionsTemplate;
    });
  }

  ngOnInit() {
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
    // TODO: Update once language and date settings are setup
    const dateFormat = 'dd MMMM yyyy';
    const instruction = this.instructionForm.value;
    instruction.locale = 'en';
    instruction.dateFormat = dateFormat;
    instruction.fromDate = this.datePipe.transform(instruction.fromDate, dateFormat);
    instruction.toDate = this.datePipe.transform(instruction.toDate, dateFormat);
    this.organizationService.getStandingInstructions(instruction).subscribe((response: any) => {
      this.setInstructions(response.pageItems);
    });
  }

}
