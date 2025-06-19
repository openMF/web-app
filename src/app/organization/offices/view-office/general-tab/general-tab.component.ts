/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgIf } from '@angular/common';
import { ExternalIdentifierComponent } from '../../../../shared/external-identifier/external-identifier.component';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';

/**
 * Office View General Tab
 */
@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
  imports: [
    HasPermissionDirective,
    MatButton,
    RouterLink,
    FaIconComponent,
    NgIf,
    ExternalIdentifierComponent,
    TranslatePipe,
    DateFormatPipe,
    NgxTranslatePipe
  ]
})
export class GeneralTabComponent {
  /** Office data */
  officeData: any;

  /**
   * Fetches office data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { office: any }) => {
      this.officeData = data.office;
    });
  }
}
