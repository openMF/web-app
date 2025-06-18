/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { CentersService } from '../../../centers.service';
import { MatCard } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Staff Assignment History Component
 */
@Component({
  selector: 'mifosx-staff-assignment-history',
  templateUrl: './staff-assignment-history.component.html',
  styleUrls: ['./staff-assignment-history.component.scss'],
  imports: [
    MatCard,
    MatButton,
    RouterLink,
    FaIconComponent,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class StaffAssignmentHistoryComponent implements OnInit {
  /** Staff Assignment History Data */
  staffAssignmentHistoryData: any;
  /** trusted resource url for pentaho output */
  pentahoUrl: any;

  /**
   * @param {DomSanitizer} sanitizer DOM Sanitizer
   */
  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute
  ) {
    this.route.data.subscribe((data: { centersActionData: any }) => {
      this.staffAssignmentHistoryData = data.centersActionData;
    });
  }

  ngOnInit() {
    const contentType = this.staffAssignmentHistoryData.headers.get('Content-Type');
    const file = new Blob([this.staffAssignmentHistoryData.body], { type: contentType });
    const filecontent = URL.createObjectURL(file);
    this.pentahoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(filecontent);
  }
}
