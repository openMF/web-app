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

  LineChart: any = [];
  BarChart: any = [];

  constructor() { }

  ngOnInit(): void {
    // Line chart:
    this.LineChart = new Chart('assetGrowth', {
      type: 'line',
      data: {
        labels: ["Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan '21"],
        datasets: [{
          label: 'Jumlah Aset Per Akhir Bulan',
          data: [950, 945, 955, 963, 987, 999, 1003, 989, 1005, 1030, 1031, 1026],
          fill: true,

          lineTension: 0.5,
          borderColor: "green",
          borderWidth: 1
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: false,
        title: {
          text: "Total Assets",
          display: false
        },
        scales: {
          xAxes: {
            gridLines: {
              display: false
            }
          },
          yAxes: {
            ticks: {
              beginAtZero: true
            },
            gridLines: {
              display: false,
              drawOnChartArea: false
            }
          }
        }
      }
    });

    // Bar chart:
    this.BarChart = new Chart('outstandingGrowth', {
      type: 'bar',
      data: {
        labels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan '21"],
        datasets: [{
          label: 'Jumlah Financings Outstanding Per Akhir Bulan',
          data: [510, 490, 520, 551, 552, 522],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: false,
        title: {
          text: "Outsanding Loan",
          display: false
        },
        scales: {
          xAxes: {
            gridLines: {
              display: false
            }
          },
          yAxes: {
            ticks: {
              beginAtZero: true
            },
            gridLines: {
              display: false,
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

}