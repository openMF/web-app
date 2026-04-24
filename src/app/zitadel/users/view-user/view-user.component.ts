/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
//import { UsersService } from '../users.service';
import { UsersServiceZitadel } from '../usersZitadel.service';

/** aUTH zITADEL */
import { AuthService } from 'app/zitadel/auth.service';

/** Custom Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { ChangePasswordDialogComponent } from 'app/zitadel/shared/change-password-dialog/change-password-dialog.component';
import { strings } from '@angular-devkit/schematics';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/**
 * View user component.
 */
@Component({
  selector: 'mifosx-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FontAwesomeModule
  ]
})
export class ViewUserComponent {
  /** User Data. */
  userData: any;

  /**
   * Retrieves the user data from `resolve`.
   * @param {UsersServiceZitadel} usersServiceZitadel Users Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(
    private usersService: UsersServiceZitadel,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    this.route.data.subscribe((data: { user: any }) => {
      const u = data.user.object?.result?.[0];

      const user = {
        id: u.id,
        username: u.userName,
        firstname: u.human?.profile?.firstName,
        lastname: u.human?.profile?.lastName,
        officeName: 'Head Office',
        officeId: u.user_uuid ?? null,
        availableRoles: u.availableRoles ?? 'Admin',
        selectedRoles: u.selectedRoles ?? 'Admin',
        isSelfServiceUser: u.state
      };

      this.userData = user;
    });
  }

  /**
   * Deletes the user and redirects to users.
   */
  delete() {
    const deleteUserDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `user ${this.userData.id}` }
    });

    deleteUserDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.authService.deletUser(this.userData.id);
      }
    });
  }

  /**
   * Change Password of the Users.
   */
  changeUserPassword(userId: string) {
    const changeUserPasswordDialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '440px',
      data: { id: userId }
    });
    changeUserPasswordDialogRef.afterClosed().subscribe((response: any) => {
      if (response.password && response.repeatPassword) {
        const password = response.password;
        const repeatPassword = response.repeatPassword;
        const firstname = this.userData.firstname;
        const data = { password: password, repeatPassword: repeatPassword, firstname: firstname };
      }
    });
  }

  /**
   * disable User
   */

  desactiveUser(userId: string) {
    this.authService.desactiveUser(userId);
  }

  activeUser(userId: string) {
    this.authService.activeUser(userId);
  }
}
