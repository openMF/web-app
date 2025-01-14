import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SystemService } from 'app/system/system.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'mifosx-cob-workflow',
  templateUrl: './cob-workflow.component.html',
  styleUrls: ['./cob-workflow.component.scss']
})
export class CobWorkflowComponent implements OnInit, OnDestroy {
  /** Wait time between API status calls 30 seg */
  waitTime = environment.waitTimeForCOBCatchUp || 30;
  /** Process running flag */
  @Input() isCatchUpRunning = true;
  /** Timer to refetch COB Catch-Up status every 5 seconds */
  timer: any;

  constructor(private systemService: SystemService) {}

  ngOnInit(): void {
    this.getCOBCatchUpStatus();
  }

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
