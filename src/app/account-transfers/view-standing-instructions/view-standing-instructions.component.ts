/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { HasPermissionDirective } from '../../directives/has-permission/has-permission.directive';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { NgIf } from '@angular/common';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

@Component({
  selector: 'mifosx-view-standing-instructions',
  templateUrl: './view-standing-instructions.component.html',
  styleUrls: ['./view-standing-instructions.component.scss'],
  imports: [
    MatButton,
    RouterLink,
    FaIconComponent,
    HasPermissionDirective,
    MatCard,
    MatCardContent,
    MatDivider,
    NgIf,
    TranslatePipe,
    DateFormatPipe,
    NgxTranslatePipe
  ]
})
export class ViewStandingInstructionsComponent {
  /** Standing Instructions Data */
  standingInstructionsData: any;
  /** Allow Client Edit */
  allowclientedit = false;

  /**
   * Retrieves the standing instructions data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { standingInstructionsData: any }) => {
      this.standingInstructionsData = data.standingInstructionsData;
      if (this.standingInstructionsData.fromClient.id === this.standingInstructionsData.toClient.id) {
        this.allowclientedit = false;
      }
    });
  }
}
