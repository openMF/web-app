/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { forkJoin, merge } from 'rxjs';
import { skip } from 'rxjs/operators';

/** Custom Services */
import { HomeService } from '../../home.service';

/** Charting Imports */
import { Dates } from 'app/core/utils/dates';
import Chart from 'chart.js';

/**
 * Client Trends Bar Chart Component.
 */
@Component({
  selector: 'mifosx-client-trends-bar',
  templateUrl: './client-trends-bar.component.html',
  styleUrls: ['./client-trends-bar.component.scss']
})
export class ClientTrendsBarComponent implements OnInit {

  /** Static Form control for office Id */
  officeId = new UntypedFormControl();
  /** Static Form control for time scale */
  timescale = new UntypedFormControl();
  /** Office Data */
  officeData: any;
  /** Chart.js chart */
  chart: any;
  /** Substitute for resolver */
  hideOutput = true;

  /**
   * Fetches offices data from `resolve`
   * @param {HomeService} homeService Home Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Dates} dateUtils Date Utils
   */
  constructor(private homeService: HomeService,
              private route: ActivatedRoute,
              private dateUtils: Dates) {
    this.route.data.subscribe( (data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  ngOnInit() {
    this.getChartData();
    this.initializeControls();
  }

  /**
   * Initialize the form controls for better UX.
   */
  initializeControls() {
    this.officeId.patchValue(1);
    this.timescale.patchValue('Day');
  }

  /**
   * Subscribes to value changes of officeID and timescale controls,
   * Fetches data accordingly and sets charts based on fetched data.
   */
  getChartData() {
    merge(this.officeId.valueChanges, this.timescale.valueChanges).pipe(skip(1))
      .subscribe(() => {
        const officeId = this.officeId.value;
        const timescale = this.timescale.value;
        switch (timescale) {
          case 'Day':
            const clientsByDay = this.homeService.getClientTrendsByDay(officeId);
            const loansByDay = this.homeService.getLoanTrendsByDay(officeId);
            forkJoin([clientsByDay, loansByDay]).subscribe((data: any[]) => {
              const dayLabels = this.getLabels(timescale);
              const clientCounts = this.getCounts(data[0], dayLabels, timescale, 'client');
              const loanCounts = this.getCounts(data[1], dayLabels, timescale, 'loan');
              this.setChart(dayLabels, clientCounts, loanCounts);
              this.hideOutput = false;
            });
            break;
          case 'Week':
            const clientsByWeek = this.homeService.getClientTrendsByWeek(officeId);
            const loansByWeek = this.homeService.getLoanTrendsByWeek(officeId);
            forkJoin([clientsByWeek, loansByWeek]).subscribe((data: any[]) => {
              const weekLabels = this.getLabels(timescale);
              const clientCounts = this.getCounts(data[0], weekLabels, timescale, 'client');
              const loanCounts = this.getCounts(data[1], weekLabels, timescale, 'loan');
              this.setChart(weekLabels, clientCounts, loanCounts);
              this.hideOutput = false;
            });
            break;
          case 'Month':
            const clientsByMonth = this.homeService.getClientTrendsByMonth(officeId);
            const loansByMonth = this.homeService.getLoanTrendsByMonth(officeId);
            forkJoin([clientsByMonth, loansByMonth]).subscribe((data: any[]) => {
              const monthLabels = this.getLabels(timescale);
              const clientCounts = this.getCounts(data[0], monthLabels, timescale, 'client');
              const loanCounts = this.getCounts(data[1], monthLabels, timescale, 'loan');
              this.setChart(monthLabels, clientCounts, loanCounts);
              this.hideOutput = false;
            });
            break;
        }
    });
  }

  /**
   * Gets Abscissa Labels.
   * @param {string} timescale User's timescale choice.
   */
  getLabels(timescale: string) {
    const date = new Date();
    const labelsArray = [];
    switch (timescale) {
      case 'Day':
        while (labelsArray.length < 12) {
          date.setDate(date.getDate() - 1);
          const transformedDate = this.dateUtils.formatDate(date, 'd/M');
          labelsArray.push(transformedDate);
        }
        break;
      case 'Week':
        /** 1st January of present year */
        const onejan = new Date(date.getFullYear(), 0, 1);
        while (labelsArray.length < 12) {
          date.setDate(date.getDate() - 7);
          /** Gets current week number */
          const weekNumber = Math.ceil(
            (((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7
          );
          labelsArray.push(weekNumber);
        }
        break;
      case 'Month':
        while (labelsArray.length < 12) {
          const transformedDate = this.dateUtils.formatDate(date, 'MMMM');
          labelsArray.push(transformedDate);
          date.setMonth(date.getMonth() - 1);
        }
        break;
    }
    return labelsArray.reverse();
  }

  /**
   * Get bar heights for clients/loans trends.
   * @param {any[]} response API response array.
   * @param {any[]} labels Abscissa Labels.
   * @param {string} timescale User's timescale choice.
   * @param {string} type 'client' or 'loan'.
   */
  getCounts(response: any[], labels: any[], timescale: string, type: string) {
    let counts: number[]  = [];
    switch (timescale) {
      case 'Day':
        labels.forEach((label: any) => {
          const day = response.find((entry: any) => {
            const transformedDate = this.dateUtils.formatDate(entry.days, 'd/M');
            return transformedDate === label;
          });
          counts = this.updateCount(day, counts, type);
        });
        break;
      case 'Week':
        labels.forEach((label: any) => {
          const week = response.find((entry: any) => {
            return entry.Weeks === label;
          });
          counts = this.updateCount(week, counts, type);
        });
        break;
      case 'Month':
        labels.forEach((label: any) => {
          const month = response.find((entry: any) => {
            return entry.Months === label;
          });
          counts = this.updateCount(month, counts, type);
        });
        break;
    }
    return counts;
  }

  /**
   * Updates the counts array.
   * @param {any} span Time span.
   * @param {any[]} counts Counts.
   * @param {string} type 'client' or 'loan'
   */
  updateCount(span: any, counts: any[], type: string) {
    if (span) {
      switch (type) {
        case 'client':
          counts.push(span.count);
        break;
        case 'loan':
          counts.push(span.lcount);
        break;
      }
    } else {
      counts.push(0);
    }
    return counts;
  }

  /**
   * Creates an instance of Chart.js multi-bar chart.
   * Refer: https://www.chartjs.org/docs/latest/charts/bar.html for configuration details.
   * @param {any[]} labels Abscissa Labels.
   * @param {number[]} clientCounts Clients Ordinate.
   * @param {number[]} loanCounts Loans Ordinate.
   */
  setChart(labels: any[], clientCounts: number[], loanCounts: number[]) {
    if (!this.chart) {
      this.chart = new Chart('client-trends-bar', {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'New Clients',
              data: clientCounts,
              backgroundColor: 'dodgerblue',
              borderColor: 'dodgerblue',
              borderWidth: 2,
              fill: false
            },
            {
              label: 'Loans Disbursed',
              data: loanCounts,
              backgroundColor: 'red',
              borderColor: 'red',
              borderWidth: 2,
              fill: false,
            }
          ]
        },
        options: {
          responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Values',
                            fontColor: '#1074B9'
                        }
                    },
                }
        }
      });
    } else {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = clientCounts;
      this.chart.data.datasets[1].data = loanCounts;
      this.chart.update();
    }
  }

}
