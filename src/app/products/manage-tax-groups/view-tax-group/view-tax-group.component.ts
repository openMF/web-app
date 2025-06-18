/** Angular Imports. */
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCard, MatCardContent } from '@angular/material/card';
import { NgFor, NgIf } from '@angular/common';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';

/**
 * View Tax Group component.
 */
@Component({
  selector: 'mifosx-view-tax-group',
  templateUrl: './view-tax-group.component.html',
  styleUrls: ['./view-tax-group.component.scss'],
  imports: [
    HasPermissionDirective,
    MatButton,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardContent,
    NgFor,
    NgIf,
    DateFormatPipe,
    NgxTranslatePipe
  ]
})
export class ViewTaxGroupComponent {
  /** tax Group Data. */
  taxGroupData: any;

  /**
   * Retrieves the tax Group data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { taxGroup: any }) => {
      this.taxGroupData = data.taxGroup;
    });
  }
}
