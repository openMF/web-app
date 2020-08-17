/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { SystemService } from '../../system.service';

/** Custom Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/**
 * View Account Number Preference Component.
 */
@Component({
  selector: 'mifosx-view-account-number-preference',
  templateUrl: './view-account-number-preference.component.html',
  styleUrls: ['./view-account-number-preference.component.scss']
})
export class ViewAccountNumberPreferenceComponent implements OnInit {

  /** Account Number Preference Data */
  accountNumberPreferenceData: any;

  /**
   * Retrieves the account number preference data from `resolve`.
   * @param {SystemService} systemService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(private route: ActivatedRoute,
              private systemService: SystemService,
              private router: Router,
              private dialog: MatDialog) {
    this.route.data.subscribe((data: { accountNumberPreference: any }) => {
      this.accountNumberPreferenceData = data.accountNumberPreference;
    });
  }

  ngOnInit() {
  }

  /**
   * Deletes the account number preference and redirects to account number preferences.
   */
  delete() {
    const deleteAccountNumberPreferenceDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `account number preference ${this.accountNumberPreferenceData.id}` }
    });
    deleteAccountNumberPreferenceDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.systemService.deleteAccountNumberPreference(this.accountNumberPreferenceData.id)
          .subscribe(() => {
            this.router.navigate(['/system/account-number-preferences']);
          });
      }
    });
  }

}
