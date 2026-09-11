/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnDestroy,
  Input,
  inject
} from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

/** rxjs Imports */
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/** Custom Services */
import { ReportsService } from '../../reports.service';
import { SettingsService } from 'app/settings/settings.service';
import { ProgressBarService } from 'app/core/progress-bar/progress-bar.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * BIRT Component
 *
 * <p>Renders the output of an Eclipse BIRT report. The reporting engine returns a different kind of
 * document per output type, so each is presented the way a browser can actually show it: markup is
 * rendered inline, a PDF is handed to the browser's viewer, and a spreadsheet or data export — which
 * an iframe would either download behind the user's back or display as binary noise — is offered as
 * a download instead.
 */
@Component({
  selector: 'mifosx-birt',
  templateUrl: './birt.component.html',
  styleUrls: ['./birt.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirtComponent implements OnChanges, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private reportsService = inject(ReportsService);
  private settingsService = inject(SettingsService);
  private progressBarService = inject(ProgressBarService);
  private changeDetectorRef = inject(ChangeDetectorRef);

  /** Run Report Data */
  @Input() dataObject: any;

  /** substitute for resolver */
  hideOutput = true;

  /**
   * Report markup, rendered through `srcdoc`.
   *
   * <p>BIRT builds its table of contents, its charts and its interactive tables in script, so the
   * frame holding them is sandboxed with `allow-scripts` and without `allow-same-origin`. That puts
   * the report on an opaque origin, where its scripts run but cannot reach this application. The
   * markup is trusted past Angular's sanitizer for the same reason: stripping the scripts would
   * leave a report that renders but does nothing, and the sandbox, not the sanitizer, is what
   * contains them.
   */
  reportHtml: SafeHtml | null = null;

  /** trusted resource url for BIRT output the browser renders itself, such as a PDF */
  birtUrl: SafeResourceUrl | null = null;

  /** Set for an output the browser cannot display, which is offered as a download instead. */
  downloadUrl: SafeUrl | null = null;

  /** File name offered for a download-only output. */
  downloadName = '';

  /** The object URL currently held, revoked when it is replaced or the component goes away. */
  private currentBlobUrl: string | null = null;

  /**
   * Fetches run report data post changes in run report form.
   */
  ngOnChanges() {
    this.hideOutput = true;
    this.getRunReportData();
  }

  ngOnDestroy() {
    this.releaseBlobUrl();
  }

  getRunReportData() {
    this.reportsService
      .getBirtRunReportData(
        this.dataObject.report.name,
        this.dataObject.formData,
        this.settingsService.tenantIdentifier,
        this.settingsService.language.code,
        this.settingsService.dateFormat
      )
      .pipe(
        finalize(() => this.progressBarService.decrease()),
        catchError((error) => {
          console.error('Error loading BIRT report:', error);
          this.clearOutput();
          this.hideOutput = true;
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (res) {
          this.present(res);
        }
        // This component is OnPush, so the response alone does not mark it dirty. Without this the
        // output is built but never rendered.
        this.changeDetectorRef.markForCheck();
      });
  }

  /**
   * Chooses how to present the returned document, based on the output type that was asked for.
   * @param {any} res Http response holding the report document.
   */
  private present(res: any): void {
    this.clearOutput();

    const outputType: string = (this.dataObject?.formData?.['output-type'] ?? '').toUpperCase();
    const contentType: string | null = res.headers.get('Content-Type');

    if (outputType === 'HTML') {
      this.reportHtml = this.sanitizer.bypassSecurityTrustHtml(this.decodeBody(res.body, contentType));
      this.hideOutput = false;
      return;
    }

    // Pinning application/pdf is not only about the engine mislabelling the response. The frame a
    // PDF is shown in cannot be sandboxed, because Chrome will not run its PDF viewer in a sandboxed
    // frame, so this type is what guarantees the document is handed to that viewer rather than
    // parsed as markup. Everything else keeps whatever the server said.
    const blobUrl = this.createBlobUrl(res.body, outputType === 'PDF' ? 'application/pdf' : contentType);

    if (outputType === 'PDF') {
      this.birtUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    } else {
      this.downloadUrl = this.sanitizer.bypassSecurityTrustUrl(blobUrl);
      this.downloadName = `${this.dataObject?.report?.name ?? 'report'}.${outputType.toLowerCase() || 'dat'}`;
    }

    this.hideOutput = false;
  }

  /**
   * Decodes the report body, honouring the character set the server declared.
   * @param {ArrayBuffer} body Report document.
   * @param {string} contentType Content type the server returned.
   * @returns {string} The decoded markup.
   */
  private decodeBody(body: ArrayBuffer, contentType: string | null): string {
    const charset = /charset=([^;]+)/i.exec(contentType ?? '')?.[1]?.trim();
    try {
      return new TextDecoder(charset || 'utf-8').decode(body);
    } catch {
      // An unrecognised charset is not worth failing the preview over.
      return new TextDecoder().decode(body);
    }
  }

  /**
   * Wraps the report document in an object URL, holding it so it can be revoked later.
   * @param {ArrayBuffer} body Report document.
   * @param {string} type Content type for the blob.
   * @returns {string} The object URL.
   */
  private createBlobUrl(body: ArrayBuffer, type: string | null): string {
    const blob = new Blob([body], { type: type ?? 'application/octet-stream' });
    this.currentBlobUrl = URL.createObjectURL(blob);
    return this.currentBlobUrl;
  }

  /** Drops the previous output, so a re-run does not leave its document behind. */
  private clearOutput(): void {
    this.releaseBlobUrl();
    this.reportHtml = null;
    this.birtUrl = null;
    this.downloadUrl = null;
    this.downloadName = '';
  }

  private releaseBlobUrl(): void {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }
}
