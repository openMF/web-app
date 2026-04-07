/** Angular Imports */
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { AccountNumberFormatService } from '@fineract/client';

/** Custom Components */
import { TranslateService } from '@ngx-translate/core';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Account Number Preference Component.
 */
@Component({
  selector: 'mifosx-view-account-number-preference',
  templateUrl: './view-account-number-preference.component.html',
  styleUrls: ['./view-account-number-preference.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ]
})
export class ViewAccountNumberPreferenceComponent {
  /** Account Number Preference Data */
  accountNumberPreferenceData: any;

  /**
   * Retrieves the account number preference data from `resolve`.
   * @param {AccountNumberFormatService} accountNumberFormatService Account Number Format Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   * @param {TranslateService} translateService Translate Service.
   */
  constructor(
    private route: ActivatedRoute,
    private accountNumberFormatService: AccountNumberFormatService,
    private router: Router,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.route.data.subscribe((data: { accountNumberPreference: any }) => {
      this.accountNumberPreferenceData = data.accountNumberPreference;
    });
  }

  /**
   * Deletes the account number preference and redirects to account number preferences.
   */
  delete() {
    const deleteAccountNumberPreferenceDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {
        deleteContext:
          this.translateService.instant('labels.heading.Account Number Preferences') +
          ' ' +
          this.accountNumberPreferenceData.id
      }
    });
    deleteAccountNumberPreferenceDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.accountNumberFormatService._delete(this.accountNumberPreferenceData.id).subscribe(() => {
          this.router.navigate(['/system/account-number-preferences']);
        });
      }
    });
  }
}
