/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-view-standing-instructions',
  templateUrl: './view-standing-instructions.component.html',
  styleUrls: ['./view-standing-instructions.component.scss']
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
    this.route.data.subscribe((data: { standingInstructionsData: any}) => {
      this.standingInstructionsData = data.standingInstructionsData;
      if (this.standingInstructionsData.fromClient.id === this.standingInstructionsData.toClient.id) {
        this.allowclientedit = false;
      }
    });
  }

}
