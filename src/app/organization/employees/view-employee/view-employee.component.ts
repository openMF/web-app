/** Angular Imports */
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Employee Component.
 */
@Component({
  selector: 'mifosx-view-employee',
  templateUrl: './view-employee.component.html',
  styleUrls: ['./view-employee.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    DateFormatPipe,
    YesnoPipe
  ]
})
export class ViewEmployeeComponent {
  private route = inject(ActivatedRoute);

  /** Employee data. */
  employeeData: any;

  /**
   * Retrieves the employee data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor() {
    this.route.data.subscribe((data: { employee: any }) => {
      this.employeeData = data.employee;
    });
  }
}
