/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

/** Custom Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { LegalFormId } from 'app/clients/models/legal-form.enum';
import { ClientsService } from 'app/clients/clients.service';
import { MatIcon } from '@angular/material/icon';
import { ReportsService } from 'app/reports/reports.service';
import { SettingsService } from 'app/settings/settings.service';
import { AlertService } from 'app/core/alert/alert.service';
import { Subject, EMPTY } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

/** Interfaces */
interface ClientViewData {
  id: number;
  accountNo?: string;
  externalId?: string;
  status?: { id: number; code: string; value: string };
  active?: boolean;
  activationDate?: number[];
  firstname?: string;
  middlename?: string;
  lastname?: string;
  fullname?: string;
  displayName?: string;
  mobileNo?: string;
  emailAddress?: string;
  dateOfBirth?: number[];
  gender?: { id: number; name: string; active?: boolean };
  clientType?: { id: number; name: string; active?: boolean };
  clientClassification?: { id: number; name: string; active?: boolean };
  legalForm?: { id: number; name: string };
  officeId?: number;
  officeName?: string;
  staffId?: number;
  staffName?: string;
  savingsProductId?: number;
  savingsProductName?: string;
  [key: string]: any; // Allow additional properties from API
}

/**
 * Personal Data Tab Component.
 * Displays all personal/client details in a read-only format.
 */
@Component({
  selector: 'mifosx-personal-data-tab',
  templateUrl: './personal-data-tab.component.html',
  styleUrls: ['./personal-data-tab.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    DateFormatPipe,
    MatIcon
  ]
})
export class PersonalDataTabComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private clientsService = inject(ClientsService);
  private sanitizer = inject(DomSanitizer);
  private reportsService = inject(ReportsService);
  private settingsService = inject(SettingsService);
  private alertService = inject(AlertService);
  private translateService = inject(TranslateService);

  /** Client View Data */
  clientViewData!: ClientViewData;
  /** PDF Display Control */
  showPdf = false;
  pdfUrl: SafeResourceUrl | null = null;
  rawPdfUrl: string | null = null;
  private destroy$ = new Subject<void>();

  constructor() {
    this.route.parent.data.pipe(takeUntilDestroyed()).subscribe((data: { clientViewData: ClientViewData }) => {
      this.clientViewData = data.clientViewData;
    });
  }

  /**
   * Check if client is a person (individual)
   */
  isPerson(): boolean {
    return this.clientViewData?.legalForm?.id === LegalFormId.PERSON;
  }

  /**
   * Check if client is a legal entity (organization)
   */
  isLegalEntity(): boolean {
    return this.clientViewData?.legalForm?.id === LegalFormId.ENTITY;
  }

  /**
   * Exports KYC report for the client using Pentaho
   */
  exportKYC() {
    if (!this.clientViewData?.id) {
      return;
    }

    const clientId = this.clientViewData.id.toString();
    const tenantIdentifier = this.settingsService.tenantIdentifier;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;

    const formData = {
      'output-type': 'PDF',
      R_clientId: clientId
    };

    this.reportsService
      .getPentahoRunReportData('KYCReport', formData, tenantIdentifier, locale, dateFormat)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error): any => {
          this.showPdf = false;
          if (this.rawPdfUrl) {
            URL.revokeObjectURL(this.rawPdfUrl);
            this.rawPdfUrl = null;
          }
          this.pdfUrl = null;
          this.alertService.alert({
            type: 'error',
            message: this.translateService.instant('errors.kycReportLoadError')
          });
          return EMPTY;
        })
      )
      .subscribe((res: any) => {
        if (this.rawPdfUrl) {
          URL.revokeObjectURL(this.rawPdfUrl);
          this.rawPdfUrl = null;
          this.pdfUrl = null;
        }
        const contentType = res.headers.get('Content-Type') || 'application/pdf';
        const file = new Blob([res.body], { type: contentType });
        this.rawPdfUrl = URL.createObjectURL(file);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPdfUrl);
        this.showPdf = true;
      });
  }

  /**
   * Closes the PDF modal
   */
  closePdf() {
    this.showPdf = false;
    if (this.rawPdfUrl) {
      URL.revokeObjectURL(this.rawPdfUrl);
      this.rawPdfUrl = null;
    }
    this.pdfUrl = null;
  }

  /**
   * Handles keyboard events on the PDF modal
   */
  onModalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closePdf();
    }
  }

  /**
   * Cleanup on component destroy
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.rawPdfUrl) {
      URL.revokeObjectURL(this.rawPdfUrl);
      this.rawPdfUrl = null;
    }
    this.pdfUrl = null;
  }
}
