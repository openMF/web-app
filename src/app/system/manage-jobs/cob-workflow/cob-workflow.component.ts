import { Component, OnDestroy, OnInit } from '@angular/core';
import { SystemService } from 'app/system/system.service';

@Component({
  selector: 'mifosx-cob-workflow',
  templateUrl: './cob-workflow.component.html',
  styleUrls: ['./cob-workflow.component.scss']
})
export class CobWorkflowComponent implements OnInit, OnDestroy {

  waitTime = 30000;

  isCatchUpRunning = false;
  /** Timer to refetch COB Catch-Up status every 5 seconds */
  timer: any;

  constructor(private systemService: SystemService) { }

  ngOnInit(): void {
    setTimeout(() => { this.getCOBCatchUpStatus(); }, this.waitTime);
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
  }

  getCOBCatchUpStatus(): void {
    this.systemService.getCOBCatchUpStatus().subscribe((response: any) => {
      this.isCatchUpRunning = response.isCatchUpRunning;
      if (!this.isCatchUpRunning) {
        this.waitTime = 30000;
      }
    });
    this.timer = setTimeout(() => { this.getCOBCatchUpStatus(); }, this.waitTime);
  }

  runCatchUp(): void {
    this.systemService.runCOBCatchUp().subscribe((response: any) => {
      this.isCatchUpRunning = true;
      this.waitTime = 5000;
    });
  }

}
