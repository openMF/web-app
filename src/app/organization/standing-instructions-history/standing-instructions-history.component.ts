/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { NgIf, NgFor } from '@angular/common';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../directives/has-permission/has-permission.directive';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { FormatNumberPipe } from '../../pipes/format-number.pipe';

/**
 * View Standing Instructions History Component.
 */
@Component({
  selector: 'mifosx-standing-instructions-history',
  templateUrl: './standing-instructions-history.component.html',
  styleUrls: ['./standing-instructions-history.component.scss'],
  imports: [
    NgIf,
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    NgFor,
    MatOption,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    TranslatePipe,
    FormatNumberPipe,
    NgxTranslatePipe
  ]
})
export class StandingInstructionsHistoryComponent implements OnInit {
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Instruction  form. */
  instructionForm: UntypedFormGroup;
  /** Standing Instructions Template */
  standingInstructionsTemplate: any;
  /** Toggles b/w form and table */
  isCollapsed = false;

  /** Columns to be displayed in instructions table. */
  displayedColumns: string[] = [
    'fromClient',
    'fromAccount',
    'toClient',
    'toAccount',
    'executionTime',
    'amount',
    'status',
    'errorLog'
  ];
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
  constructor(
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private settingsService: SettingsService,
    private router: Router,
    private route: ActivatedRoute,
    private dateUtils: Dates
  ) {
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
      clientName: [''],
      clientId: [''],
      transferType: [''],
      fromAccountType: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  /**
   * Sets conditional child controls.
   */
  buildDependencies() {
    this.instructionForm.get('fromAccountType').valueChanges.subscribe(() => {
      this.instructionForm.addControl('fromAccountId', new UntypedFormControl(''));
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
