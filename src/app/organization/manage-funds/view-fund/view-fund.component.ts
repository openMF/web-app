import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCard, MatCardContent } from '@angular/material/card';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-view-fund',
  templateUrl: './view-fund.component.html',
  styleUrls: ['./view-fund.component.scss'],
  imports: [
    HasPermissionDirective,
    MatButton,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardContent,
    ExternalIdentifierComponent,
    TranslatePipe,
    NgxTranslatePipe
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
