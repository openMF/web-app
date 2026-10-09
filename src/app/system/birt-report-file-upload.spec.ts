/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticationService } from '../core/authentication/authentication.service';
import { HasPermissionDirective } from '../directives/has-permission/has-permission.directive';
import { environment } from '../../environments/environment';
import { SystemService } from './system.service';
import {
  MAX_REPORT_DESIGN_SIZE_BYTES,
  UploadReportFileDialogComponent
} from './manage-reports/upload-report-file-dialog/upload-report-file-dialog.component';

/** Builds a File of a given size without allocating the bytes twice. */
function fileOf(name: string, size: number): File {
  const file = new File(['x'], name);
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function changeEvent(file: File | null): any {
  return { target: { files: file ? [file] : [] } };
}

describe('SystemService BIRT report design upload', () => {
  let service: SystemService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SystemService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(SystemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts the design as multipart form data to the BIRT reports resource', () => {
    const design = fileOf('Active Loans.rptdesign', 2048);

    service.uploadBirtReportFile(design).subscribe();

    const req = httpMock.expectOne('/birt/reports');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    expect((req.request.body as FormData).get('file')).toBe(design);
    req.flush({ fileName: 'Active Loans.rptdesign', size: 2048, overwritten: false });
  });

  it('leaves the multipart Content-Type to the browser so the boundary is set', () => {
    service.uploadBirtReportFile(fileOf('Active Loans.rptdesign', 10)).subscribe();

    const req = httpMock.expectOne('/birt/reports');
    expect(req.request.headers.get('Content-Type')).toBeNull();
    req.flush({});
  });

  it('surfaces a server rejection to the caller instead of swallowing it', () => {
    let status: number | undefined;
    service.uploadBirtReportFile(fileOf('Active Loans.rptdesign', 10)).subscribe({
      error: (error) => (status = error.status)
    });

    httpMock.expectOne('/birt/reports').flush({}, { status: 403, statusText: 'Forbidden' });
    expect(status).toBe(403);
  });
});

describe('UploadReportFileDialogComponent', () => {
  let component: UploadReportFileDialogComponent;

  beforeEach(() => {
    component = new UploadReportFileDialogComponent();
  });

  it('accepts a .rptdesign file and reports its size', () => {
    component.onFileSelect(changeEvent(fileOf('Active Loans.rptdesign', 2048)));

    expect(component.file?.name).toBe('Active Loans.rptdesign');
    expect(component.errorKey).toBeNull();
    expect(component.fileSizeInKb).toBe('2.0');
  });

  it('accepts a .RPTDESIGN file whatever the case of the extension', () => {
    component.onFileSelect(changeEvent(fileOf('Active Loans.RPTDESIGN', 10)));

    expect(component.file).not.toBeNull();
  });

  it.each([
    'report.pdf',
    'report.xml',
    'report.txt',
    'report.zip',
    'report.json',
    'report.prpt',
    'report'
  ])('rejects %s', (name) => {
    component.onFileSelect(changeEvent(fileOf(name, 10)));

    expect(component.file).toBeNull();
    expect(component.errorKey).toBe('labels.text.Only Eclipse BIRT report designs can be uploaded');
  });

  it('rejects a design larger than the platform accepts', () => {
    component.onFileSelect(changeEvent(fileOf('Active Loans.rptdesign', MAX_REPORT_DESIGN_SIZE_BYTES + 1)));

    expect(component.file).toBeNull();
    expect(component.errorKey).toBe('labels.text.The selected report design is too large');
  });

  it('rejects an empty design', () => {
    component.onFileSelect(changeEvent(fileOf('Active Loans.rptdesign', 0)));

    expect(component.file).toBeNull();
    expect(component.errorKey).toBe('labels.text.The selected report design is empty');
  });

  it('clears a previous rejection when a valid design is chosen next', () => {
    component.onFileSelect(changeEvent(fileOf('report.pdf', 10)));
    component.onFileSelect(changeEvent(fileOf('Active Loans.rptdesign', 10)));

    expect(component.errorKey).toBeNull();
    expect(component.file).not.toBeNull();
  });

  it('keeps nothing selected when the picker is dismissed', () => {
    component.onFileSelect(changeEvent(fileOf('Active Loans.rptdesign', 10)));
    component.onFileSelect(changeEvent(null));

    expect(component.file).toBeNull();
    expect(component.errorKey).toBeNull();
  });
});

/**
 * The upload button in Manage Reports is gated on CREATE_REPORT. This exercises that guard through
 * the same directive the template uses, rather than rendering the whole reports screen.
 */
@Component({
  standalone: true,
  imports: [HasPermissionDirective],
  template: `<button *mifosxHasPermission="'CREATE_REPORT'" id="upload">Upload Report Design</button>`
})
class UploadButtonHostComponent {}

describe('Upload Report Design button visibility', () => {
  let rbacWasEnabled: boolean;

  function renderWithPermissions(permissions: string[]): ComponentFixture<UploadButtonHostComponent> {
    TestBed.configureTestingModule({
      imports: [UploadButtonHostComponent],
      providers: [
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } }
      ]
    });
    const fixture = TestBed.createComponent(UploadButtonHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  function uploadButton(fixture: ComponentFixture<UploadButtonHostComponent>): HTMLElement | null {
    return fixture.nativeElement.querySelector('#upload');
  }

  beforeEach(() => {
    rbacWasEnabled = environment.productionModeEnableRBAC;
    environment.productionModeEnableRBAC = true;
    TestBed.resetTestingModule();
  });

  afterEach(() => {
    environment.productionModeEnableRBAC = rbacWasEnabled;
  });

  it('is shown to a user with CREATE_REPORT', () => {
    expect(uploadButton(renderWithPermissions(['CREATE_REPORT']))).not.toBeNull();
  });

  it('is shown to a super user', () => {
    expect(uploadButton(renderWithPermissions(['ALL_FUNCTIONS']))).not.toBeNull();
  });

  it('is hidden from a user who may only read reports', () => {
    expect(uploadButton(renderWithPermissions(['READ_REPORT']))).toBeNull();
  });

  it('is hidden from a user with a blanket read grant', () => {
    expect(uploadButton(renderWithPermissions(['ALL_FUNCTIONS_READ']))).toBeNull();
  });
});
