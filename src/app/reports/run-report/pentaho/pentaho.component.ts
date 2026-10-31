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
  Component,
  DestroyRef,
  OnChanges,
  OnDestroy,
  Input,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

/** rxjs Imports */
import { finalize, catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

/** Custom Services */
import { ReportsService } from '../../reports.service';
import { SettingsService } from 'app/settings/settings.service';
import { ProgressBarService } from 'app/core/progress-bar/progress-bar.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Fixed MIME types for the output types the component exposes as a download.
 *
 * The type is chosen here rather than taken from the response: a reporting engine that labels an
 * XLS, XLSX, CSV or XML body `text/html` would otherwise produce a blob URL that executes as markup
 * when it is opened directly. XML deliberately uses `application/octet-stream`, because there is no
 * single safe XML media type and the file is only ever offered for download.
 */
const DOWNLOAD_MIME_TYPES: Readonly<Record<string, string>> = {
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  CSV: 'text/csv',
  XML: 'application/octet-stream'
};

/**
 * Pentaho Component
 *
 * <p>Renders the output of a Pentaho report. The reporting engine returns a different kind of
 * document per output type, so each is presented the way a browser can actually show it: markup is
 * rendered inline inside a sandboxed frame, a PDF is handed to the browser's viewer, and a
 * spreadsheet or data export — which an iframe would either download behind the user's back or
 * display as binary noise — is offered as a download instead.
 *
 * <p>The frame is sandboxed with `allow-scripts` and without `allow-same-origin`, matching the BIRT
 * renderer (`BirtComponent`). A report body is generated from a design this application does not control
 * and may carry markup it did not write, so the document is shown on an opaque origin: its scripts
 * still run, but they cannot reach the application, its DOM, or the credentials it keeps in web
 * storage. The markup is deliberately trusted past Angular's sanitizer for the same reason —
 * stripping the scripts would leave a report that renders but does nothing, and the sandbox, not the
 * sanitizer, is what contains them.
 *
 * <p>Nothing the server says decides how its bytes are read. HTML output is decoded to text and
 * placed in `srcdoc`; a PDF is pinned to `application/pdf` so it reaches the browser's viewer rather
 * than a markup parser; every other output type is only ever offered as a download. A
 * `Content-Type`, which the reporting engine rather than this application chooses, therefore cannot
 * promote a response into markup running inside the application's origin.
 */
@Component({
  selector: 'mifosx-pentaho',
  templateUrl: './pentaho.component.html',
  styleUrls: ['./pentaho.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PentahoComponent implements OnChanges, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private reportsService = inject(ReportsService);
  private settingsService = inject(SettingsService);
  private progressBarService = inject(ProgressBarService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Run Report Data */
  @Input() dataObject: any;

  /** substitute for resolver */
  hideOutput = true;

  /** Report markup, rendered through `srcdoc` inside a sandboxed frame. */
  reportHtml: SafeHtml | null = null;

  /** trusted resource url for output the browser renders itself, such as a PDF */
  pentahoUrl: SafeResourceUrl | null = null;

  /** Set for an output the browser cannot display, which is offered as a download instead. */
  downloadUrl: SafeUrl | null = null;

  /** File name offered for a download-only output. */
  downloadName = '';

  /** The object URL currently held, revoked when it is replaced or the component goes away. */
  private currentBlobUrl: string | null = null;

  /** The request currently in flight, cancelled when the report is re-run or the component goes away. */
  private reportSubscription: Subscription | null = null;

  /** Identifies the latest run, so a superseded response cannot update the current output. */
  private requestSequence = 0;

  /**
   * Fetches run report data post changes in run report form.
   */
  ngOnChanges() {
    this.hideOutput = true;
    this.getRunReportData();
  }

  ngOnDestroy() {
    this.cancelPendingRequest();
    this.releaseBlobUrl();
  }

  getRunReportData() {
    // A new run replaces the previous one: abort the in-flight request so its response cannot be
    // presented after this one, and drop the document it may already have produced.
    this.cancelPendingRequest();
    this.clearOutput();

    const requestId = ++this.requestSequence;
    const outputType: string = (this.dataObject?.formData?.['output-type'] ?? '').toUpperCase();
    const reportName: string = this.dataObject?.report?.name ?? 'report';

    this.reportSubscription = this.reportsService
      .getPentahoRunReportData(
        reportName,
        this.dataObject.formData,
        this.settingsService.tenantIdentifier,
        this.settingsService.language.code,
        this.settingsService.dateFormat
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.progressBarService.decrease()),
        catchError((error) => {
          // A superseded request is ignored, so an old failure cannot clear the current report.
          if (requestId === this.requestSequence) {
            console.error('Error loading Pentaho report:', error);
            this.clearOutput();
            this.hideOutput = true;
            this.changeDetectorRef.markForCheck();
          }
          return of(null);
        })
      )
      .subscribe((res: any) => {
        if (requestId !== this.requestSequence) {
          return;
        }
        if (res) {
          this.present(res, outputType, reportName);
        }
        // This component is OnPush, so the response alone does not mark it dirty. Without this the
        // output is built but never rendered.
        this.changeDetectorRef.markForCheck();
      });
  }

  /**
   * Chooses how to present the returned document, based on the output type that was asked for.
   * @param {any} res Http response holding the report document.
   * @param {string} outputType Output type captured when this request started.
   * @param {string} reportName Report name captured when this request started.
   */
  private present(res: any, outputType: string, reportName: string): void {
    this.clearOutput();

    const contentType: string | null = res.headers.get('Content-Type');

    if (outputType === 'HTML') {
      this.reportHtml = this.sanitizer.bypassSecurityTrustHtml(this.decodeBody(res.body, contentType));
      this.hideOutput = false;
      return;
    }

    // Pinning application/pdf is not only about the engine mislabelling the response. The frame a
    // PDF is shown in cannot be sandboxed, because Chrome will not run its PDF viewer inside a
    // sandboxed frame, so this type is what guarantees the document is handed to that viewer rather
    // than parsed as markup.
    if (outputType === 'PDF') {
      const blobUrl = this.createBlobUrl(res.body, 'application/pdf');
      this.pentahoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.isTicketReport(reportName) ? `${blobUrl}#zoom=500` : blobUrl
      );
      this.hideOutput = false;
      return;
    }

    // Everything else is only ever downloaded, and only for the formats this screen offers. An
    // output type the form does not define is not turned into a link at all.
    const downloadMimeType = DOWNLOAD_MIME_TYPES[outputType];
    if (!downloadMimeType) {
      this.hideOutput = true;
      return;
    }

    const blobUrl = this.createBlobUrl(res.body, downloadMimeType);
    this.downloadUrl = this.sanitizer.bypassSecurityTrustUrl(blobUrl);
    this.downloadName = `${reportName}.${outputType.toLowerCase()}`;
    this.hideOutput = false;
  }

  /**
   * Decodes the report body, honouring the character set the server declared.
   * @param {ArrayBuffer} body Report document.
   * @param {string} contentType Content type the server returned.
   * @returns {string} The decoded markup.
   */
  private decodeBody(body: ArrayBuffer, contentType: string | null): string {
    const charset = this.extractCharset(contentType);
    try {
      return new TextDecoder(charset || 'utf-8').decode(body);
    } catch {
      // An unrecognised charset is not worth failing the preview over.
      return new TextDecoder().decode(body);
    }
  }

  /**
   * Reads the charset parameter from a Content-Type header.
   *
   * HTTP allows the value to be quoted, as in `text/html; charset="windows-1252"`. The quotes are
   * part of the syntax, not the label, so they are removed before the value reaches `TextDecoder`.
   * @param {string | null} contentType Content type the server returned.
   * @returns {string} Charset label, or an empty string when none was declared.
   */
  private extractCharset(contentType: string | null): string {
    const match = /charset\s*=\s*(?:"([^"]*)"|'([^']*)'|([^;\s]+))/i.exec(contentType ?? '');
    return (match?.[1] ?? match?.[2] ?? match?.[3] ?? '').trim();
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

  isTicketReport(reportName: string = this.dataObject?.report?.name ?? ''): boolean {
    return reportName?.toLowerCase().includes('-ticket') || false;
  }

  /** Cancels the in-flight request, if any, so its response is not presented later. */
  private cancelPendingRequest(): void {
    this.reportSubscription?.unsubscribe();
    this.reportSubscription = null;
  }

  /** Drops the previous output, so a re-run does not leave its document behind. */
  private clearOutput(): void {
    this.releaseBlobUrl();
    this.reportHtml = null;
    this.pentahoUrl = null;
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
