/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangePasswordDialogComponent } from 'app/shared/change-password-dialog/change-password-dialog.component';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services. */
import { UserService } from '../user.service';

/**
 * View self service user component.
 *
 * TODO: Complete functionality once API is available.
 */
@Component({
  selector: 'mifosx-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.scss']
})
export class ViewUserComponent implements OnInit {

  /** Self service user. */
  user: any;

  /**
   * Retrieves the user data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {UserService} userService Users Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(private route: ActivatedRoute,
              private userService: UserService,
              private router: Router,
              private dialog: MatDialog) {
    this.route.data.subscribe((data: { user: any }) => {
      this.user = data.user;
    });
  }

  ngOnInit() {
  }

  /**
   * Open Dialog to Change Password
   */
  changeUserPassword() {
    const changeUserPasswordDialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '400px',
      height: '300px'
    });
    changeUserPasswordDialogRef.afterClosed().subscribe((response: any) => {
      if (response.password && response.repeatPassword) {
        const password = response.password;
        const repeatPassword = response.repeatPassword;
        const data =  {password: password, repeatPassword: repeatPassword };
        this.userService.changePassword(this.user.id, data).subscribe(() => {
          this.router.navigate(['/..']);
        });
      }
    });
  }

}
