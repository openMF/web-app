/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { AnalyticsWidgetState } from '../models/analytics-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardExportService {
  /**
   * Export dashboard data as CSV
   * @param widgets Dashboard widgets with data
   * @param fileName File name for export
   */
  exportAsCSV(
    widgets: { id: string; title: string; state: AnalyticsWidgetState }[],
    fileName: string = 'dashboard'
  ): void {
    const data: string[][] = [];

    // Add timestamp
    data.push([
      'Export Date',
      new Date().toLocaleString()
    ]);
    data.push([]);

    // Process each widget
    widgets.forEach((widget) => {
      if (widget.state.loading || widget.state.empty) {
        return;
      }

      // Add widget title
      data.push([widget.title]);

      if (widget.state.metricValue !== undefined) {
        // Metric widget
        data.push([
          'Metric Value',
          widget.state.metricValue.toString()
        ]);
      } else if (widget.state.datasets && widget.state.labels) {
        // Chart widget
        const headers = [
          'Label',
          ...widget.state.datasets.map((d) => d.labelKey)
        ];
        data.push(headers);

        widget.state.labels.forEach((label, index) => {
          const row = [label];
          widget.state.datasets?.forEach((dataset) => {
            row.push((dataset.data[index] || 0).toString());
          });
          data.push(row);
        });
      }

      // Add empty row between widgets
      data.push([]);
    });

    // Convert to CSV
    const csv = data.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

    // Create and download file
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    element.setAttribute('download', `${fileName}_${new Date().getTime()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  /**
   * Export dashboard data as PDF
   * @param widgets Dashboard widgets with data
   * @param fileName File name for export
   */
  exportAsPDF(
    widgets: { id: string; title: string; state: AnalyticsWidgetState }[],
    fileName: string = 'dashboard'
  ): void {
    // Note: This requires jsPDF and html2canvas libraries
    // For now, provide a placeholder implementation that uses browser's print function
    // In production, integrate with jsPDF/html2canvas

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      const htmlContent = this.generatePDFHTML(widgets);
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }

  /**
   * Generate HTML for PDF export
   */
  private generatePDFHTML(widgets: { id: string; title: string; state: AnalyticsWidgetState }[]): string {
    let html = `
      <html>
        <head>
          <title>Dashboard Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            h2 { color: #666; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .metric { font-size: 24px; font-weight: bold; color: #2196f3; }
            .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <h1>Dashboard Export</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
    `;

    widgets.forEach((widget) => {
      if (widget.state.loading || widget.state.empty) {
        return;
      }

      html += `<h2>${widget.title}</h2>`;

      if (widget.state.metricValue !== undefined) {
        html += `<p class="metric">Value: ${widget.state.metricValue}</p>`;
      } else if (widget.state.datasets && widget.state.labels) {
        html += '<table>';
        html += '<tr>';
        html += '<th>Label</th>';
        widget.state.datasets.forEach((dataset) => {
          html += `<th>${dataset.labelKey}</th>`;
        });
        html += '</tr>';

        widget.state.labels.forEach((label, index) => {
          html += '<tr>';
          html += `<td>${label}</td>`;
          widget.state.datasets?.forEach((dataset) => {
            html += `<td>${dataset.data[index] || 0}</td>`;
          });
          html += '</tr>';
        });
        html += '</table>';
      }
    });

    html += `
          <div class="footer">
            <p>This is an automated export from Mifos X Global Dashboard</p>
          </div>
        </body>
      </html>
    `;

    return html;
  }
}
