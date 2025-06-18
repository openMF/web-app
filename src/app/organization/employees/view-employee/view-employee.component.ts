/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCard, MatCardContent } from '@angular/material/card';
import { NgIf } from '@angular/common';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';

/**
 * View Employee Component.
 */
@Component({
  selector: 'mifosx-view-employee',
  templateUrl: './view-employee.component.html',
  styleUrls: ['./view-employee.component.scss'],
  imports: [
    HasPermissionDirective,
    MatButton,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardContent,
    NgIf,
    TranslatePipe,
    DateFormatPipe,
    YesnoPipe,
    NgxTranslatePipe
  ]
})
export class ViewEmployeeComponent {
  /** Employee data. */
  employeeData: any;

  /**
   * Retrieves the employee data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { employee: any }) => {
      this.employeeData = data.employee;
    });
  }
}
