/** Angular Imports. */
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Tax Group component.
 */
@Component({
  selector: 'mifosx-view-tax-group',
  templateUrl: './view-tax-group.component.html',
  styleUrls: ['./view-tax-group.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    DateFormatPipe
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
