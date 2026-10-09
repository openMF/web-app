/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsWidgetState } from '../models/analytics-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardExportService {
  private translateService = inject(TranslateService);

  private getTranslation(key: string, fallback?: string): string {
    if (!key) {
      return fallback || '';
    }
    const translated = this.translateService.instant(key);
    if (translated && translated !== key) {
      return translated;
    }
    return fallback !== undefined ? fallback : key;
  }

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
      this.getTranslation('labels.inputs.Export Date', 'Export Date'),
      new Date().toLocaleString(this.translateService.currentLang || undefined)
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
          this.getTranslation('labels.inputs.Value', 'Value'),
          widget.state.metricValue.toString()
        ]);
      } else if (widget.state.datasets && widget.state.labels) {
        // Chart widget
        const headers = [
          this.getTranslation('labels.inputs.Label', 'Label'),
          ...widget.state.datasets.map((d) => this.getTranslation(d.labelKey, d.labelKey))
        ];
        data.push(headers);

        widget.state.labels.forEach((label, index) => {
          const rowLabel = widget.state.translateLabels ? this.getTranslation(label, label) : label;
          const row = [rowLabel];
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
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      const htmlContent = this.generatePDFHTML(widgets);
      doc.open();
      doc.write(htmlContent);
      doc.close();

      const cleanup = () => {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 100);
      };

      if (iframe.contentWindow) {
        iframe.contentWindow.onafterprint = cleanup;
      }

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(cleanup, 1000);
      }, 150);
    }
  }

  /**
   * Generate HTML for PDF export
   */
  private generatePDFHTML(widgets: { id: string; title: string; state: AnalyticsWidgetState }[]): string {
    const dashboardTitle = this.getTranslation('labels.text.Dashboard Export', 'Dashboard Export');
    const generatedOnText = this.getTranslation('labels.text.Generated on', 'Generated on');
    const labelHeaderText = this.getTranslation('labels.inputs.Label', 'Label');
    const metricValText = this.getTranslation('labels.inputs.Value', 'Value');
    const footerText = this.getTranslation(
      'labels.text.Automated export',
      'This is an automated export from Mifos X Global Dashboard'
    );

    let html = `
      <html>
        <head>
          <title>${dashboardTitle}</title>
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
          <h1>${dashboardTitle}</h1>
          <p>${generatedOnText}: ${new Date().toLocaleString(this.translateService.currentLang || undefined)}</p>
    `;

    widgets.forEach((widget) => {
      if (widget.state.loading || widget.state.empty) {
        return;
      }

      html += `<h2>${widget.title}</h2>`;

      if (widget.state.metricValue !== undefined) {
        html += `<p class="metric">${metricValText}: ${widget.state.metricValue}</p>`;
      } else if (widget.state.datasets && widget.state.labels) {
        html += '<table>';
        html += '<tr>';
        html += `<th>${labelHeaderText}</th>`;
        widget.state.datasets.forEach((dataset) => {
          const translatedHeader = this.getTranslation(dataset.labelKey, dataset.labelKey);
          html += `<th>${translatedHeader}</th>`;
        });
        html += '</tr>';

        widget.state.labels.forEach((label, index) => {
          const rowLabel = widget.state.translateLabels ? this.getTranslation(label, label) : label;
          html += '<tr>';
          html += `<td>${rowLabel}</td>`;
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
            <p>${footerText}</p>
          </div>
        </body>
      </html>
    `;

    return html;
  }
}
