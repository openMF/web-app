/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject
} from '@angular/core';
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { TranslateService } from '@ngx-translate/core';

/* Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';
import { SystemService } from '../system.service';
import { AlertService } from '../../core/alert/alert.service';

/** Custom Dialog Component */
import { CompletionDialogComponent } from '../../configuration-wizard/completion-dialog/completion-dialog.component';
import { UploadReportFileDialogComponent } from './upload-report-file-dialog/upload-report-file-dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Manage Reports Component.
 */
@Component({
  selector: 'mifosx-manage-reports',
  templateUrl: './manage-reports.component.html',
  styleUrls: ['./manage-reports.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
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
    MatPaginator
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageReportsComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private configurationWizardService = inject(ConfigurationWizardService);
  private popoverService = inject(PopoverService);
  private dialog = inject(MatDialog);
  private systemService = inject(SystemService);
  private alertService = inject(AlertService);
  private translateService = inject(TranslateService);

  /** Reports Data. */
  reportsData: any;
  /** Columns to be displayed in reports table. */
  displayedColumns: string[] = [
    'reportName',
    'reportType',
    'reportSubType',
    'reportCategory',
    'coreReport',
    'userReport'
  ];
  /** Data source for reports table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for reports table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for reports table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of Create Report Button */
  @ViewChild('buttonCreateReport') buttonCreateReport: ElementRef<any>;
  /* Template for popover on Create Report Button */
  @ViewChild('templateButtonCreateReport') templateButtonCreateReport: TemplateRef<any>;

  /**
   * Retrieves the reports data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   * @param {Matdialog} matdialog Matdialog.
   */
  constructor() {
    this.route.data.subscribe((data: { reports: any }) => {
      this.reportsData = data.reports;
    });
  }

  /**
   * Sets the reports table.
   */
  ngOnInit() {
    this.setReports();
  }

  /**
   * Initializes the data source, paginator and sorter for reports table.
   */
  setReports() {
    this.dataSource = new MatTableDataSource(this.reportsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters data in reports table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Installs an Eclipse BIRT report design on the server.
   *
   * Only the success case is announced here. Every failure the server returns already reaches the
   * user through the global error interceptor, with the server's own message, so reporting it again
   * would show the same problem twice.
   */
  uploadReportDesign(): void {
    const dialogRef = this.dialog.open(UploadReportFileDialogComponent, { width: '33rem' });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (!response?.file) {
        return;
      }
      this.systemService.uploadBirtReportFile(response.file).subscribe((result: any) => {
        this.alertService.alert({
          type: 'Report Design Uploaded',
          message: this.translateService.instant(
            result?.overwritten ? 'labels.text.Report design replaced' : 'labels.text.Report design uploaded',
            { fileName: result?.fileName ?? response.file.name }
          )
        });
      });
    });
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showManageReports) {
      setTimeout(() => {
        this.showPopover(this.templateButtonCreateReport, this.buttonCreateReport.nativeElement, 'bottom', true);
      });
    }
  }

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(
    template: TemplateRef<any>,
    target: HTMLElement | ElementRef<any>,
    position: string,
    backdrop: boolean
  ): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * Next Step (Home) Configuration Wizard Tour Complete.
   */
  nextStep() {
    this.configurationWizardService.showManageReports = false;
    this.openNextStepDialog();
  }

  /**
   * Previous Step (Manage Reports System Page) Configuration Wizard.
   */
  previousStep() {
    this.router.navigate(['/system']);
  }

  /**
   * Completed Configuration Wizard Tour Dialog.
   */
  openNextStepDialog() {
    const completionDialogRef = this.dialog.open(CompletionDialogComponent);
    completionDialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/home']);
    });
  }
}
