/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { UsersService } from '../users.service';

/** Custom Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { ChangePasswordDialogComponent } from 'app/shared/change-password-dialog/change-password-dialog.component';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCard, MatCardContent } from '@angular/material/card';
import { NgIf, NgFor } from '@angular/common';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';

/**
 * View user component.
 */
@Component({
  selector: 'mifosx-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.scss'],
  standalone: true,
  imports: [
    MatButton,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardContent,
    NgIf,
    NgFor,
    NgxTranslatePipe
  ]
})
export class ViewUserComponent {
  /** User Data. */
  userData: any;

  /**
   * Retrieves the user data from `resolve`.
   * @param {UsersService} usersService Users Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(
    private usersService: UsersService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.route.data.subscribe((data: { user: any }) => {
      this.userData = data.user;
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
        this.usersService.deleteUser(this.userData.id).subscribe(() => {
          this.router.navigate(['/appusers']);
        });
      }
    });
  }

  /**
   * Change Password of the Users.
   */
  changeUserPassword() {
    const changeUserPasswordDialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '440px'
    });
    changeUserPasswordDialogRef.afterClosed().subscribe((response: any) => {
      if (response.password && response.repeatPassword) {
        const password = response.password;
        const repeatPassword = response.repeatPassword;
        const firstname = this.userData.firstname;
        const data = { password: password, repeatPassword: repeatPassword, firstname: firstname };
        this.usersService.changePassword(this.userData.id, data).subscribe(() => {
          this.router.navigate(['/appusers']);
        });
      }
    });
  }
}
