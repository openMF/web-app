/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { forkJoin, merge } from 'rxjs';
import { skip } from 'rxjs/operators';

/** Custom Services */
import { HomeService } from '../home.service';

/** Charting Imports */
import { Dates } from 'app/core/utils/dates';
import { Chart, registerables } from 'chart.js';
import { MatCardHeader } from '@angular/material/card';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgStyle } from '@angular/common';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Client Trends Bar Chart Component.
 */
@Component({
  selector: 'mifosx-client-trends-bar',
  standalone: true, // ✅ REQUIRED FIX
  templateUrl: './client-trends-bar.component.html',
  styleUrls: ['./client-trends-bar.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardHeader,
    FaIconComponent,
    NgStyle,
    MatButtonToggleGroup,
    MatButtonToggle
  ]
})
export class ClientTrendsBarComponent implements OnInit {
  /** Static Form controls */
  officeId = new UntypedFormControl();
  timescale = new UntypedFormControl();

  /** Data & chart */
  officeData: any;
  chart: any;
  hideOutput = true;

  constructor(
    private homeService: HomeService,
    private route: ActivatedRoute,
    private dateUtils: Dates
  ) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  ngOnInit() {
    this.initializeControls();
    this.getChartData();
  }

  initializeControls() {
    this.officeId.patchValue(1);
    this.timescale.patchValue('Day');
  }

  getChartData() {
    merge(this.officeId.valueChanges, this.timescale.valueChanges)
      .pipe(skip(1))
      .subscribe(() => {
        const officeId = this.officeId.value;
        const timescale = this.timescale.value;

        switch (timescale) {
          case 'Day': {
            const clientsByDay = this.homeService.getClientTrendsByDay(officeId);
            const loansByDay = this.homeService.getLoanTrendsByDay(officeId);
            forkJoin([
              clientsByDay,
              loansByDay
            ]).subscribe((data: any[]) => {
              const labels = this.getLabels(timescale);
              const clientCounts = this.getCounts(data[0], labels, timescale, 'client');
              const loanCounts = this.getCounts(data[1], labels, timescale, 'loan');
              this.setChart(labels, clientCounts, loanCounts);
              this.hideOutput = false;
            });
            break;
          }

          case 'Week': {
            const clientsByWeek = this.homeService.getClientTrendsByWeek(officeId);
            const loansByWeek = this.homeService.getLoanTrendsByWeek(officeId);
            forkJoin([
              clientsByWeek,
              loansByWeek
            ]).subscribe((data: any[]) => {
              const labels = this.getLabels(timescale);
              const clientCounts = this.getCounts(data[0], labels, timescale, 'client');
              const loanCounts = this.getCounts(data[1], labels, timescale, 'loan');
              this.setChart(labels, clientCounts, loanCounts);
              this.hideOutput = false;
            });
            break;
          }

          case 'Month': {
            const clientsByMonth = this.homeService.getClientTrendsByMonth(officeId);
            const loansByMonth = this.homeService.getLoanTrendsByMonth(officeId);
            forkJoin([
              clientsByMonth,
              loansByMonth
            ]).subscribe((data: any[]) => {
              const labels = this.getLabels(timescale);
              const clientCounts = this.getCounts(data[0], labels, timescale, 'client');
              const loanCounts = this.getCounts(data[1], labels, timescale, 'loan');
              this.setChart(labels, clientCounts, loanCounts);
              this.hideOutput = false;
            });
            break;
          }
        }
      });
  }

  getLabels(timescale: string) {
    const date = new Date();
    const labelsArray = [];

    switch (timescale) {
      case 'Day':
        while (labelsArray.length < 12) {
          date.setDate(date.getDate() - 1);
          labelsArray.push(this.dateUtils.formatDate(date, 'd/M'));
        }
        break;

      case 'Week':
        const onejan = new Date(date.getFullYear(), 0, 1);
        while (labelsArray.length < 12) {
          date.setDate(date.getDate() - 7);
          const weekNumber = Math.ceil(((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
          labelsArray.push(weekNumber);
        }
        break;

      case 'Month':
        while (labelsArray.length < 12) {
          labelsArray.push(this.dateUtils.formatDate(date, 'MMMM'));
          date.setMonth(date.getMonth() - 1);
        }
        break;
    }

    return labelsArray.reverse();
  }

  getCounts(response: any[], labels: any[], timescale: string, type: string) {
    let counts: number[] = [];

    labels.forEach((label) => {
      let entry: any;

      if (timescale === 'Day') {
        entry = response.find((item: any) => this.dateUtils.formatDate(item.days, 'd/M') === label);
      } else if (timescale === 'Week') {
        entry = response.find((item: any) => item.Weeks === label);
      } else if (timescale === 'Month') {
        entry = response.find((item: any) => item.Months === label);
      }

      counts = this.updateCount(entry, counts, type);
    });

    return counts;
  }

  updateCount(entry: any, counts: number[], type: string) {
    if (entry) {
      counts.push(type === 'client' ? entry.count : entry.lcount);
    } else {
      counts.push(0);
    }
    return counts;
  }

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
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              min: 0,
              title: { display: true, text: 'Values', color: '#1074B9' }
            }
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
