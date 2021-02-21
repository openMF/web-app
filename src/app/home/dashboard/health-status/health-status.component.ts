import { Component, OnInit } from '@angular/core';

/** Charting Imports */
import Chart from 'chart.js';

@Component({
  selector: 'mifosx-health-status',
  templateUrl: './health-status.component.html',
  styleUrls: ['./health-status.component.scss']
})
export class HealthStatusComponent implements OnInit {
  /** Substitute for resolver */
  hideOutput = true;
  /** Shows fallback element */
  showFallback = false;

  constructor() { }

  ngOnInit(): void {
  }

}
