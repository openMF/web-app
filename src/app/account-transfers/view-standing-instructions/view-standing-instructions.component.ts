/** Angular Imports */
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatDivider } from '@angular/material/divider';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-standing-instructions',
  templateUrl: './view-standing-instructions.component.html',
  styleUrls: ['./view-standing-instructions.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatDivider,
    DateFormatPipe
  ]
})
export class ViewStandingInstructionsComponent {
  private route = inject(ActivatedRoute);

  /** Standing Instructions Data */
  standingInstructionsData: any;
  /** Allow Client Edit */
  allowclientedit = false;

  /**
   * Retrieves the standing instructions data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor() {
    this.route.data.subscribe((data: { standingInstructionsData: any }) => {
      this.standingInstructionsData = data.standingInstructionsData;
      if (this.standingInstructionsData.fromClient.id === this.standingInstructionsData.toClient.id) {
        this.allowclientedit = false;
      }
    });
  }
}
