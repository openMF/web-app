/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { ProgressBarService } from 'app/core/progress-bar/progress-bar.service';
import { SettingsService } from 'app/settings/settings.service';
import { PentahoComponent } from './pentaho.component';

/**
 * Hosts the component rather than creating it directly.
 *
 * <p>PentahoComponent is OnPush, and a fixture created for it directly is its own root, so its view
 * is checked on every `detectChanges()` whether or not the component asked for it. Behind a host, it
 * is only checked when it marks itself dirty — which is the condition the output actually depends on.
 */
@Component({
  standalone: true,
  imports: [PentahoComponent],
  template: `<mifosx-pentaho [dataObject]="dataObject"></mifosx-pentaho>`
})
class HostComponent {
  dataObject: any = null;
}

/** Builds an ArrayBuffer from ASCII text, standing in for a report document. */
function documentOf(text: string): ArrayBuffer {
  const bytes = new Uint8Array(text.length);
  for (let index = 0; index < text.length; index++) {
    bytes[index] = text.charCodeAt(index);
  }
  return bytes.buffer;
}

/** Builds an ArrayBuffer from raw bytes, for documents in a non-UTF-8 encoding. */
function documentOfBytes(bytes: number[]): ArrayBuffer {
  return Uint8Array.from(bytes).buffer;
}

/** ASCII byte values, used to assemble a document around a single non-ASCII byte. */
function asciiBytes(text: string): number[] {
  return Array.from(text, (character) => character.charCodeAt(0));
}

/**
 * A report body carrying a script, which is what the renderer has to contain.
 *
 * <p>`parent.sessionStorage` is the line that matters: it is only reachable from the application's
 * own origin, so a body that is framed same-origin can read the credentials the app keeps there.
 */
const MARKUP_WITH_SCRIPT =
  '<html><body><script>document.body.setAttribute("data-ran", "1");' +
  'parent.sessionStorage.getItem("mifosXCredentials");</script></body></html>';

describe('PentahoComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let httpMock: HttpTestingController;
  let createObjectURL: jest.Mock;
  let revokeObjectURL: jest.Mock;

  beforeEach(async () => {
    let issued = 0;
    createObjectURL = jest.fn(() => `blob:report/${++issued}`);
    revokeObjectURL = jest.fn();
    Object.defineProperty(window.URL, 'createObjectURL', { value: createObjectURL, writable: true });
    Object.defineProperty(window.URL, 'revokeObjectURL', { value: revokeObjectURL, writable: true });

    await TestBed.configureTestingModule({
      imports: [
        HostComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ProgressBarService,
        {
          provide: SettingsService,
          useValue: { tenantIdentifier: 'acme', language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' }
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HostComponent);
  });

  afterEach(() => {
    httpMock.verify();
  });

  /** Runs a report of the given output type and hands back the request awaiting a response. */
  function run(outputType: string, reportName = 'Active Loans'): TestRequest {
    fixture.componentInstance.dataObject = {
      report: { name: reportName },
      formData: { 'output-type': outputType }
    };
    fixture.detectChanges();
    return httpMock.expectOne((req) => req.url === `/runreports/${reportName}`);
  }

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  it('previews HTML output inline', () => {
    run('HTML').flush(documentOf('<html><body>Report</body></html>'), {
      headers: { 'Content-Type': 'text/html' }
    });
    fixture.detectChanges();

    const frame = query('iframe') as HTMLIFrameElement;
    expect(frame.srcdoc).toContain('Report');
    expect(frame.getAttribute('src')).toBeNull();
  });

  it('decodes a report whose charset is quoted', () => {
    // 0x80 is the euro sign in windows-1252. Passing the quoted label straight to TextDecoder would
    // throw and fall back to UTF-8, which renders this byte as the replacement character instead.
    const body = documentOfBytes([
      ...asciiBytes('<html><body>'),
      0x80,
      ...asciiBytes('</body></html>')
    ]);

    run('HTML').flush(body, { headers: { 'Content-Type': 'text/html; charset="windows-1252"' } });
    fixture.detectChanges();

    expect((query('iframe') as HTMLIFrameElement).srcdoc).toContain('€');
  });

  it('runs the report markup on an opaque origin instead of this application one', () => {
    run('HTML').flush(documentOf(MARKUP_WITH_SCRIPT), { headers: { 'Content-Type': 'text/html' } });
    fixture.detectChanges();

    // Reports build their charts and interactive tables in script, so they have to run; an
    // opaque origin is what stops them reaching the session, the DOM and the API around them.
    const sandbox = query('iframe')?.getAttribute('sandbox');
    expect(sandbox).toContain('allow-scripts');
    expect(sandbox).not.toContain('allow-same-origin');
  });

  it('never frames HTML, whatever content type the reporting engine declares', () => {
    // The type is chosen by the engine, not by this application, so it must not be what decides
    // whether a response is parsed as markup.
    run('HTML').flush(documentOf(MARKUP_WITH_SCRIPT), {
      headers: { 'Content-Type': 'application/octet-stream' }
    });
    fixture.detectChanges();

    const frame = query('iframe') as HTMLIFrameElement;
    expect(frame.srcdoc).toContain('parent.sessionStorage');
    expect(frame.getAttribute('src')).toBeNull();
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it('hands a PDF to the browser viewer rather than rendering it as markup', () => {
    run('PDF').flush(documentOf('%PDF-1.4'), { headers: { 'Content-Type': 'application/pdf' } });
    fixture.detectChanges();

    const frame = query('iframe') as HTMLIFrameElement;
    expect(frame.getAttribute('src')).toBe('blob:report/1');
    expect(frame.srcdoc).toBe('');
  });

  it('leaves the PDF frame unsandboxed, which is the only way Chrome will render it', () => {
    // Chrome refuses to run its PDF viewer inside a sandboxed frame and blocks the page instead.
    // The blob's pinned application/pdf type is what keeps that safe, so assert it alongside — even
    // when the engine labels the response as markup.
    run('PDF').flush(documentOf('%PDF-1.4'), { headers: { 'Content-Type': 'text/html' } });
    fixture.detectChanges();

    expect(query('iframe')?.hasAttribute('sandbox')).toBe(false);
    expect(createObjectURL).toHaveBeenCalledWith(expect.objectContaining({ type: 'application/pdf' }));
  });

  it('keeps the ticket zoom fragment on the PDF viewer URL', () => {
    run('PDF', 'Loan Ticket-Ticket').flush(documentOf('%PDF-1.4'), {
      headers: { 'Content-Type': 'application/pdf' }
    });
    fixture.detectChanges();

    expect((query('iframe') as HTMLIFrameElement).getAttribute('src')).toBe('blob:report/1#zoom=500');
  });

  it.each([
    [
      'XLS',
      'application/vnd.ms-excel'
    ],
    [
      'XLSX',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    [
      'CSV',
      'text/csv'
    ],
    [
      'XML',
      'application/octet-stream'
    ]
  ])('offers %s output as a download with the fixed %s MIME type', (outputType, mimeType) => {
    run(outputType).flush(documentOf('id,name'), { headers: { 'Content-Type': 'application/octet-stream' } });
    fixture.detectChanges();

    expect(query('iframe')).toBeNull();
    const link = query('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('blob:report/1');
    expect(link.getAttribute('download')).toBe(`Active Loans.${outputType.toLowerCase()}`);
    expect(createObjectURL).toHaveBeenCalledWith(expect.objectContaining({ type: mimeType }));
  });

  it('does not trust a text/html Content-Type for a CSV download', () => {
    run('CSV').flush(documentOf('<html><body><script>alert(1)</script></body></html>'), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
    fixture.detectChanges();

    // A download link is not enough on its own: the blob URL can be opened directly, so the type
    // has to be fixed here instead of being copied from the reporting engine's response.
    expect(query('iframe')).toBeNull();
    const link = query('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('blob:report/1');
    expect(link.getAttribute('download')).toBe('Active Loans.csv');
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/csv');
    expect(blob.type).not.toBe('text/html');
  });

  it('does not turn an output type the screen does not offer into a download', () => {
    run('TXT').flush(documentOf('text'), { headers: { 'Content-Type': 'text/plain' } });
    fixture.detectChanges();

    expect(query('iframe')).toBeNull();
    expect(query('a')).toBeNull();
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it('cancels a superseded request so its response cannot overwrite the current one', () => {
    run('PDF');

    fixture.componentInstance.dataObject = {
      report: { name: 'Active Loans' },
      formData: { 'output-type': 'HTML' }
    };
    fixture.detectChanges();

    // Cancelling the subscription also aborts the HttpClient request, so the first request is gone.
    httpMock.expectNone((req) => req.params.get('output-type') === 'PDF');
    httpMock
      .expectOne((req) => req.params.get('output-type') === 'HTML')
      .flush(documentOf('<html><body>New report</body></html>'), {
        headers: { 'Content-Type': 'text/html' }
      });
    fixture.detectChanges();

    expect(query('iframe')?.getAttribute('srcdoc')).toContain('New report');
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it('cancels a pending request when the component is destroyed', () => {
    run('PDF');

    fixture.destroy();

    httpMock.expectNone((req) => req.url === '/runreports/Active Loans');
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(revokeObjectURL).not.toHaveBeenCalled();
  });

  it('runs the report against the tenant the user is working in', () => {
    const request = run('HTML');

    expect(request.request.params.get('tenantIdentifier')).toBe('acme');
    request.flush(documentOf('<html></html>'), { headers: { 'Content-Type': 'text/html' } });
  });

  it('releases the previous document when the report is run again', () => {
    run('PDF').flush(documentOf('%PDF-1.4'), { headers: { 'Content-Type': 'application/pdf' } });
    fixture.detectChanges();

    fixture.componentInstance.dataObject = {
      report: { name: 'Active Loans' },
      formData: { 'output-type': 'PDF' }
    };
    fixture.detectChanges();
    httpMock
      .expectOne((req) => req.url === '/runreports/Active Loans')
      .flush(documentOf('%PDF-1.4'), { headers: { 'Content-Type': 'application/pdf' } });
    fixture.detectChanges();

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:report/1');
    expect((query('iframe') as HTMLIFrameElement).getAttribute('src')).toBe('blob:report/2');
  });

  it('releases the document when the output goes away', () => {
    run('PDF').flush(documentOf('%PDF-1.4'), { headers: { 'Content-Type': 'application/pdf' } });
    fixture.detectChanges();

    fixture.destroy();

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:report/1');
  });

  it('shows nothing and holds no document when the report fails', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    run('HTML').flush(documentOf('boom'), { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(query('iframe')).toBeNull();
    expect(query('a')).toBeNull();
    expect(createObjectURL).not.toHaveBeenCalled();
  });
});
