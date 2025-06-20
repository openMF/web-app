import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-fund',
  templateUrl: './view-fund.component.html',
  styleUrls: ['./view-fund.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    ExternalIdentifierComponent
  ]
})
export class ViewFundComponent {
  /** Fund data. */
  fundData: any;

  /**
   * Retrieves the charge data from `resolve`.
   * @param {Router} router Router for navigation.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { fundData: any }) => {
      this.fundData = data.fundData;
    });
  }
}
