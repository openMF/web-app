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
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';

/**
 * View tax Component component.
 */
@Component({
  selector: 'mifosx-view-tax-component',
  templateUrl: './view-tax-component.component.html',
  styleUrls: ['./view-tax-component.component.scss'],
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
    FormatNumberPipe,
    NgxTranslatePipe
  ]
})
export class ViewTaxComponentComponent {
  /** tax Component Data. */
  taxComponentData: any;

  /**
   * Retrieves the tax Component data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { taxComponent: any }) => {
      this.taxComponentData = data.taxComponent;
    });
  }
}
