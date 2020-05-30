/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

/** Custom Services */
import { HomeService } from '../../home.service';

/** Charting Imports */
import Chart from 'chart.js';

/**
 * Amount Collected Pie Chart Component
 */
@Component({
  selector: 'mifosx-amount-collected-pie',
  templateUrl: './amount-collected-pie.component.html',
  styleUrls: ['./amount-collected-pie.component.scss']
})
export class AmountCollectedPieComponent implements OnInit {

  /** Static Form control for office Id */
  officeId = new FormControl();
  /** Office Data */
  officeData: any;
  /** Chart.js chart */
  chart: any;
  /** Substitute for resolver */
  hideOutput = true;
  /** Shows fallback element */
  showFallback = false;

  /**
   * Fetches offices data from `resolve`.
   * @param {HomeService} homeService Home Service.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private homeService: HomeService,
              private route: ActivatedRoute) {
    this.route.data.subscribe( (data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  /**
   * Sets the pie chart
   * Initialize with office Id 1 for better UX.
   */
  ngOnInit() {
    this.getChartData();
    this.officeId.patchValue(1);
  }

  /**
   * Subscribes to value changes of office Id fetches chart data accordingly.
   */
  getChartData() {
    this.officeId.valueChanges.subscribe((value: number) => {
      this.homeService.getCollectedAmount(value).subscribe((response: any) => {
        const data =  Object.entries(response[0]).map(entry => entry[1]);
        if (!(data[0] === 0 && data[1] === 0)) {
          this.setChart(data);
          this.hideOutput = false;
          this.showFallback = false;
        } else {
          this.showFallback = true;
          this.hideOutput = true;
        }
      });
    });
  }

  /**
   * Creates an instance of Chart.js pie chart
   * Refer: https://www.chartjs.org/docs/latest/charts/doughnut.html for configuration details.
   * @param {any} data Chart Data.
   */
  setChart(data: any) {
    if (!this.chart) {
      this.chart = new Chart('collection-pie', {
        type: 'pie',
        data: {
          labels: ['Pending', 'Collected'],
          datasets: [{
            backgroundColor: ['red', 'green'],
            data: data
          }]
        },
        options: {
          layout: {
            padding: {
              top: 10,
              bottom: 15
            }
          }
        }
      });
    } else {
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    }
  }

}
