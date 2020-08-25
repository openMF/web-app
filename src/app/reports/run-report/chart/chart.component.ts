/** Angular Imports */
import { Component, OnChanges, Input } from '@angular/core';

/** Custom Services */
import { ReportsService } from '../../reports.service';

/** Custom Models */
import { ChartData } from '../../common-models/chart-data.model';

/** Charting Imports */
import Chart from 'chart.js';

/**
 * Chart Component
 */
@Component({
  selector: 'mifosx-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss' ]
})
export class ChartComponent implements OnChanges {

  /** Run Report Data */
  @Input() dataObject: any;

  /** chart data object */
  chart: any;
  /** substitute for resolver */
  hideOutput = true;
  /** Data object for witching charts in view. */
  inputData: ChartData;

  /**
   * @param {ReportsService} reportsService Reports Service
   */
  constructor(private reportsService: ReportsService) { }

  /**
   * Fetches run report data post changes in run report form.
   */
  ngOnChanges() {
    this.getRunReportData();
  }

  getRunReportData() {
    this.reportsService.getChartRunReportData(this.dataObject.report.name, this.dataObject.formData)
    .subscribe((response: ChartData) => {
      this.inputData = response;
      this.setPieChart(this.inputData);
      this.hideOutput = false;
    });
  }

  /**
   * Creates instance of chart.js pie chart.
   * Refer: https://www.chartjs.org/docs/latest/charts/doughnut.html for configuration details.
   */
  setPieChart(inputData: ChartData) {
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart('output', {
      type: 'pie',
      data: {
          labels: inputData.keys,
          datasets: [{
              label: inputData.valuesLabel,
              data: inputData.values,
              backgroundColor: this.randomColorArray(inputData.values.length)
          }]
      },
      options: {
        title: {
          display: true,
          text: inputData.keysLabel
        }
      }
    });
  }

  /**
   * Creates instance of chart.js bar chart.
   * Refer: https://www.chartjs.org/docs/latest/charts/bar.html for configuration details.
   */
  setBarChart(inputData: ChartData) {
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart('output', {
      type: 'bar',
      data: {
        labels: inputData.keys,
        datasets: [{
            label: inputData.valuesLabel,
            data: inputData.values,
            backgroundColor: this.randomColorArray(inputData.values.length)
        }]
      },
      options: {
        legend: { display: false },
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: inputData.keysLabel
            },
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  /**
   * Generates bar/pie-slice colors array for dynamic charts.
   * @param {number} length Length of dataset array.
   */
  randomColorArray(length: number) {
    const colorArray: any[] = [];
    while (length--) {
      const color = this.randomColor();
      colorArray.push(color);
    }
    return colorArray;
  }

  /**
   * Returns a random rgb color.
   */
  randomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r},${g},${b},0.6)`;
  }

}
