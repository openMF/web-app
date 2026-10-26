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
import { BirtComponent } from './birt.component';

/**
 * Hosts the component rather than creating it directly.
 *
 * <p>BirtComponent is OnPush, and a fixture created for it directly is its own root, so its view is
 * checked on every `detectChanges()` whether or not the component asked for it. Behind a host, it is
 * only checked when it marks itself dirty — which is the condition the preview actually depends on.
 */
@Component({
  standalone: true,
  imports: [BirtComponent],
  template: `<mifosx-birt [dataObject]="dataObject"></mifosx-birt>`
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

describe('BirtComponent', () => {
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
    run('HTML').flush(documentOf('<html><body><h1>Active Loans</h1></body></html>'), {
      headers: { 'Content-Type': 'text/html; charset=UTF-8' }
    });
    fixture.detectChanges();

    const frame = query('iframe') as HTMLIFrameElement;
    expect(frame).not.toBeNull();
    expect(frame.srcdoc).toContain('Active Loans');
  });

  it('keeps the report markup out of this application by sandboxing the frame it runs in', () => {
    run('HTML').flush(documentOf('<html><body>report</body></html>'), {
      headers: { 'Content-Type': 'text/html' }
    });
    fixture.detectChanges();

    // Scripts are what BIRT draws its charts and table of contents with, so they have to run; an
    // opaque origin is what stops them reaching the session around them.
    const sandbox = query('iframe')?.getAttribute('sandbox');
    expect(sandbox).toContain('allow-scripts');
    expect(sandbox).not.toContain('allow-same-origin');
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
    // The blob's pinned application/pdf type is what keeps that safe, so assert it alongside.
    run('PDF').flush(documentOf('%PDF-1.4'), { headers: { 'Content-Type': 'text/html' } });
    fixture.detectChanges();

    expect(query('iframe')?.hasAttribute('sandbox')).toBe(false);
    expect(createObjectURL).toHaveBeenCalledWith(expect.objectContaining({ type: 'application/pdf' }));
  });

  it.each([
    'XLS',
    'XLSX',
    'CSV',
    'XML'
  ])('offers %s output as a download instead of an unreadable preview', (outputType) => {
    run(outputType).flush(documentOf('id,name'), { headers: { 'Content-Type': 'application/octet-stream' } });
    fixture.detectChanges();

    expect(query('iframe')).toBeNull();
    const link = query('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('blob:report/1');
    expect(link.getAttribute('download')).toBe(`Active Loans.${outputType.toLowerCase()}`);
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

  it('releases the document when the preview goes away', () => {
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
