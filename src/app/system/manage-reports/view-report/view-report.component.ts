/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { SystemService } from 'app/system/system.service';

/** Custom Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgIf } from '@angular/common';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';

/**
 * View Report Component.
 */
@Component({
  selector: 'mifosx-view-report',
  templateUrl: './view-report.component.html',
  styleUrls: ['./view-report.component.scss'],
  imports: [
    HasPermissionDirective,
    MatButton,
    RouterLink,
    FaIconComponent,
    NgIf,
    MatCard,
    MatCardTitle,
    MatCardContent,
    TranslatePipe,
    YesnoPipe,
    NgxTranslatePipe
  ]
})
export class ViewReportComponent {
  /** Report Data. */
  reportData: any;

  /**
   * Retrieves the report data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {SystemService} systemService System Service.
   * @param {MatDialog} dialog Dialog Reference.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private route: ActivatedRoute,
    private systemService: SystemService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.route.data.subscribe((data: { report: any }) => {
      this.reportData = data.report;
    });
  }

  /**
   * Deletes the current report.
   */
  delete() {
    const deleteReportDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `report ${this.reportData.id}` }
    });
    deleteReportDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.systemService.deleteReport(this.reportData.id).subscribe(() => {
          this.router.navigate(['/system/reports']);
        });
      }
    });
  }
}
