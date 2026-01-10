/** Angular Imports */
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View tax Component component.
 */
@Component({
  selector: 'mifosx-view-tax-component',
  templateUrl: './view-tax-component.component.html',
  styleUrls: ['./view-tax-component.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    DateFormatPipe,
    FormatNumberPipe
  ]
})
export class ViewTaxComponentComponent {
  private route = inject(ActivatedRoute);

  /** tax Component Data. */
  taxComponentData: any;

  /**
   * Retrieves the tax Component data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor() {
    this.route.data.subscribe((data: { taxComponent: any }) => {
      this.taxComponentData = data.taxComponent;
    });
  }
}
