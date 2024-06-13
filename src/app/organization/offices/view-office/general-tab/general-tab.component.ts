/** Angular Imports */
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'app/core/alert/alert.service';
import { OrganizationService } from 'app/organization/organization.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/**
 * Office View General Tab
 */
@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
})
export class GeneralTabComponent {
  /** Office data */
  officeData: any;

  /**
   * Fetches office data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private organizationService: OrganizationService,
    private alertService: AlertService
  ) {
    this.route.parent.data.subscribe((data: { office: any }) => {
      this.officeData = data.office;
    });
  }

  deleteOffice() {
    const deleteOutletDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.officeData.name },
    });
    deleteOutletDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationService.deleteOffice(this.officeData.id).subscribe(
          () => {
            this.officeData.status = false;
          },
          (error) => {
            console.log(error);
            this.alertService.alert({
              type: 'Deletion Error',
              message: 'Error while deleting Office. Please try again.',
            });
          }
        );
      }
    });
  }
  activateOffice() {
    const activateOfficeDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { dialogContext: 'Are you sure to Activate ' + this.officeData.name, heading: 'Activate Office' },
    });
    activateOfficeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.organizationService.activateOffice(this.officeData.id).subscribe(
          () => {
            this.officeData.status = true;
          },
          (error) => {
            console.log(error);
            this.alertService.alert({
              type: 'Activation Error',
              message: 'Error while activating Office. Please try again.',
            });
          }
        );
      }
    });
  }
  deActivateOffice() {
    const deActivateOfficeDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { dialogContext: 'Are you sure to DeActivate ' + this.officeData.name, heading: 'DeActivate Office' },
    });
    deActivateOfficeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.organizationService.deactivateOffice(this.officeData.id).subscribe(
          () => {
            this.officeData.status = false;
          },
          (error) => {
            console.log(error);
            this.alertService.alert({
              type: 'DeActivation Error',
              message: 'Error while deactivating Office. Please try again.',
            });
          }
        );
      }
    });
  }
}
