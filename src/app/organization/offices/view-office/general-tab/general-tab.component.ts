/** Angular Imports */
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ExternalIdentifierComponent } from '../../../../shared/external-identifier/external-identifier.component';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Office View General Tab
 */
@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    ExternalIdentifierComponent,
    DateFormatPipe
  ]
})
export class GeneralTabComponent {
  private route = inject(ActivatedRoute);

  /** Office data */
  officeData: any;

  /**
   * Fetches office data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   */
  constructor() {
    this.route.data.subscribe((data: { office: any }) => {
      this.officeData = data.office;
    });
  }
}
