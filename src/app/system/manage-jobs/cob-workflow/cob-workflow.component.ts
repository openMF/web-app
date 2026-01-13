/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, Input, OnDestroy, inject } from '@angular/core';
import { SystemService } from 'app/system/system.service';
import { environment } from '../../../../environments/environment';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { LoanLockedComponent } from './loan-locked/loan-locked.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-cob-workflow',
  templateUrl: './cob-workflow.component.html',
  styleUrls: ['./cob-workflow.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    LoanLockedComponent
  ]
})
export class CobWorkflowComponent implements OnDestroy {
  private systemService = inject(SystemService);

  /** Wait time between API status calls 30 seg */
  waitTime = environment.waitTimeForCOBCatchUp || 30;
  /** Process running flag */
  @Input() isCatchUpRunning = true;
  /** Timer to refetch COB Catch-Up status every 5 seconds */
  timer: any;

  ngOnDestroy() {
    clearTimeout(this.timer);
  }

  getCOBCatchUpStatus(): void {
    this.systemService.getCOBCatchUpStatus().subscribe((response: any) => {
      this.isCatchUpRunning = response.isCatchUpRunning;
    });
    this.timer = setTimeout(() => {
      this.getCOBCatchUpStatus();
    }, this.waitTime * 1000);
  }

  runCatchUp(): void {
    this.systemService.runCOBCatchUp().subscribe((response: any) => {
      this.isCatchUpRunning = true;
      this.waitTime = 5000;
    });
  }
}
