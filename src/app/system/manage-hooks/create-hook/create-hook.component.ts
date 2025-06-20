/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { SystemService } from '../../system.service';

/** Custom Components */
import { TranslateService } from '@ngx-translate/core';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { AddEventDialogComponent } from '../add-event-dialog/add-event-dialog.component';
import { MatFormField, MatLabel, MatError, MatHint } from '@angular/material/form-field';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create Hook Component.
 */
@Component({
  selector: 'mifosx-create-hook',
  templateUrl: './create-hook.component.html',
  styleUrls: ['./create-hook.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox,
    MatHint,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow
  ]
})
export class CreateHookComponent implements OnInit {
  /** Hooks Template Data. */
  hooksTemplateData: any;
  /** Hook Form. */
  hookForm: UntypedFormGroup;
  /** Columns to be displayed in events table. */
  displayedColumns: string[] = [
    'entityName',
    'actionName',
    'actions'
  ];
  /** Data source for events table. */
  dataSource: MatTableDataSource<any>;
  /** Events Data. */
  eventsData: any[] = [];
  /** Sorter for events table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the hooks template data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {SystemService} systemService System Service.
   * @param {Router} router Router for navigation.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {MatDialog} dialog Dialog Reference.
   * @param {TranslateService} translateService Translate Service.
   */
  constructor(
    private route: ActivatedRoute,
    private systemService: SystemService,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.route.data.subscribe((data: { hooksTemplate: any }) => {
      this.hooksTemplateData = data.hooksTemplate;
    });
  }

  /**
   * Creates the hook form.
   */
  ngOnInit() {
    this.createHookForm();
    this.hookForm.get('name').valueChanges.subscribe((name) => {
      if (name === 'Web') {
        this.hookForm.get('contentType').enable();
        this.hookForm.get('phoneNumber').disable();
        this.hookForm.get('smsProvider').disable();
        this.hookForm.get('smsProviderAccountId').disable();
        this.hookForm.get('smsProviderToken').disable();
      } else {
        this.hookForm.get('contentType').disable();
        this.hookForm.get('phoneNumber').enable();
        this.hookForm.get('smsProvider').enable();
        this.hookForm.get('smsProviderAccountId').enable();
        this.hookForm.get('smsProviderToken').enable();
      }
    });
    this.setEvents();
  }

  /**
   * Initializes the data source, paginator and sorter for events table.
   */
  setEvents() {
    this.dataSource = new MatTableDataSource(this.eventsData);
    this.dataSource.sort = this.sort;
  }

  /**
   * Creates the hook form.
   */
  createHookForm() {
    this.hookForm = this.formBuilder.group({
      name: [
        'Web',
        Validators.required
      ],
      displayName: [
        '',
        Validators.required
      ],
      isActive: [''],
      phoneNumber: [
        { value: '', disabled: true },
        Validators.required
      ],
      smsProvider: [
        { value: '', disabled: true },
        Validators.required
      ],
      smsProviderAccountId: [
        { value: '', disabled: true },
        Validators.required
      ],
      smsProviderToken: [
        { value: '', disabled: true },
        Validators.required
      ],
      contentType: [
        '',
        Validators.required
      ],
      payloadUrl: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Adds the event form to given events form array.
   */
  addEvent() {
    const addEventDialogRef = this.dialog.open(AddEventDialogComponent, {
      data: this.hooksTemplateData
    });

    addEventDialogRef.afterClosed().subscribe((response: any) => {
      if (response) {
        this.eventsData.push({
          entityName: response.entity,
          actionName: response.action
        });
        this.dataSource.connect().next(this.eventsData);
      }
    });
  }

  /**
   * Removes the event form from given events form array at given index.
   * @param {number} index Array index from where event form needs to be removed.
   */
  deleteEvent(index: number) {
    const deleteEventDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {
        deleteContext:
          this.translateService.instant('labels.inputs.event with entity name of') +
          ' ' +
          this.eventsData[index].entityName
      }
    });
    deleteEventDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.eventsData.splice(index, 1);
        this.dataSource.connect().next(this.eventsData);
      }
    });
  }

  /**
   * Submits the hook form and creates hook,
   * if successful redirects to view created hook.
   */
  submit() {
    const hook: {
      name: string;
      isActive: boolean;
      displayName: string;
      events: any;
      config: {
        'Payload URL': string;
        'Content Type'?: string;
        'SMS Provider'?: string;
        'SMS Provider Account Id'?: string;
        'SMS Provider Token'?: string;
      };
    } = {
      name: this.hookForm.get('name').value,
      isActive: this.hookForm.get('isActive').value,
      displayName: this.hookForm.get('displayName').value,
      events: this.eventsData,
      config: {
        'Payload URL': this.hookForm.get('payloadUrl').value,
        'Content Type': this.hookForm.get('contentType').enabled ? this.hookForm.get('contentType').value : undefined,
        'SMS Provider': this.hookForm.get('smsProvider').enabled ? this.hookForm.get('smsProvider').value : undefined,
        'SMS Provider Account Id': this.hookForm.get('smsProviderAccountId').enabled
          ? this.hookForm.get('smsProviderAccountId').value
          : undefined,
        'SMS Provider Token': this.hookForm.get('smsProviderToken').enabled
          ? this.hookForm.get('smsProviderToken').value
          : undefined
      }
    };
    this.systemService.createHook(hook).subscribe((response: any) => {
      this.router.navigate(
        [
          '../',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }
}
