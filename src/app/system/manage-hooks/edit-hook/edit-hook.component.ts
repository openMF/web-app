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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgModule } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ChangeDetectorRef } from '@angular/core';

/** Custom Services */
import { SystemService } from '../../system.service';

/** Custom Components */
import { TranslateService } from '@ngx-translate/core';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { AddEventDialogComponent } from '../add-event-dialog/add-event-dialog.component';
import { MatFormField, MatLabel, MatError, MatHint } from '@angular/material/form-field';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Edit Hook Component.
 */

@Component({
  selector: 'mifosx-edit-hook',
  templateUrl: './edit-hook.component.html',
  styleUrls: ['./edit-hook.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox,
    MatHint,
    MatDivider,
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
export class EditHookComponent implements OnInit {
  @NgModule({
    imports: [
      MatSnackBarModule
    ]
  })
  /** Hooks Template Data. */
  hooksTemplateData: any;
  /** Hook Data. */
  hookData: any;
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
  cannotDeleteLastEvent: boolean = false;
  /** Boolean to check if events data is changed or not. */
  eventsDataChanged: Boolean = false;
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
    private translateService: TranslateService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.route.data.subscribe((data: { hooksTemplate: any; hook: any }) => {
      this.hooksTemplateData = data.hooksTemplate;
      this.hookData = data.hook;
      this.eventsData = data.hook.events ? data.hook.events : [];
    });
  }

  /**
   * Creates the hook form.
   */
  ngOnInit() {
    this.createHookForm();
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
        { value: this.hookData.name, disabled: true },
        Validators.required
      ],
      displayName: [
        this.hookData.displayName,
        Validators.required
      ],
      isActive: [this.hookData.isActive],
      phoneNumber: [
        {
          value: this.hookData.name === 'SMS Bridge' ? this.hookData.config[1].fieldValue : '',
          disabled: this.hookData.name !== 'SMS Bridge'
        },
        Validators.required

      ],
      smsProvider: [
        {
          value: this.hookData.name === 'SMS Bridge' ? this.hookData.config[2].fieldValue : '',
          disabled: this.hookData.name !== 'SMS Bridge'
        },
        Validators.required

      ],
      smsProviderAccountId: [
        {
          value: this.hookData.name === 'SMS Bridge' ? this.hookData.config[3].fieldValue : '',
          disabled: this.hookData.name !== 'SMS Bridge'
        },
        Validators.required

      ],
      smsProviderToken: [
        {
          value: this.hookData.name === 'SMS Bridge' ? this.hookData.config[4].fieldValue : '',
          disabled: this.hookData.name !== 'SMS Bridge'
        },
        Validators.required

      ],
      contentType: [
        {
          value: this.hookData.name === 'Web' ? this.hookData.config[0].fieldValue : '',
          disabled: this.hookData.name !== 'Web'
        },
        Validators.required

      ],
      payloadUrl: [
        this.hookData.name === 'Web' ? this.hookData.config[1].fieldValue : this.hookData.config[0].fieldValue,
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
        this.eventsDataChanged = true;
      }
    });
  }

  /**
   * Removes the event form from given events form array at given index.
   * @param {number} index Array index from where event form needs to be removed.
   */
  deleteEvent(index: number) {
    if (this.eventsData.length === 1) {
      this.snackBar.open('At least one event is required. Cannot delete the last event.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

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
        this.eventsDataChanged = true;
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Submits the hook form and updates hook,
   * if successful redirects to view updated hook.
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
    this.systemService.updateHook(this.hookData.id, hook).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
