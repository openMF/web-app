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
import { MatDialog } from '@angular/material/dialog';

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
import {
  CustomerDataValidation,
  KYC_VALIDATION_DATATABLE,
  ValidationStatus,
  emptyCustomerDataValidation
} from 'app/clients/models/document-validation.model';
import { ValidateCustomerDataDialogComponent } from '../custom-dialogs/validate-customer-data-dialog/validate-customer-data-dialog.component';

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
  legalForm?: { id: number; code: string; name: string };
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
  private dialog = inject(MatDialog);

  /** Client View Data */
  clientViewData!: ClientViewData;
  /** PDF Display Control */
  showPdf = false;
  pdfUrl: SafeResourceUrl | null = null;
  rawPdfUrl: string | null = null;
  private destroy$ = new Subject<void>();

  /** Current document validation state */
  validationData: CustomerDataValidation | null = null;
  /** True when the datatable already has a row (drives add vs edit) */
  private hasDatatableEntry = false;
  /** Expose ValidationStatus enum to template */
  readonly ValidationStatus = ValidationStatus;

  constructor() {
    this.route.parent.data.pipe(takeUntilDestroyed()).subscribe((data: { clientViewData: ClientViewData }) => {
      this.clientViewData = data.clientViewData;
      this.validationData = null;
      this.hasDatatableEntry = false;
      this.loadValidationData();
    });
  }

  /** Loads saved validation data from the datatable */
  private loadValidationData() {
    if (!this.clientViewData?.id) {
      return;
    }
    this.clientsService
      .getClientDatatable(this.clientViewData.id.toString(), KYC_VALIDATION_DATATABLE)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          // Datatable may not exist yet — silently ignore
          this.hasDatatableEntry = false;
          return EMPTY;
        })
      )
      .subscribe((res: any) => {
        const rows = res?.data;
        if (rows && rows.length > 0) {
          try {
            const raw = rows[0].row;
            // Columns order: nid_selected, nid_missing, nid_illegible, nid_invalid, nid_expired,
            //                legal_id_selected, legal_id_missing, legal_id_illegible, legal_id_invalid, legal_id_expired,
            //                proof_selected, proof_missing, proof_illegible, proof_invalid, proof_expired,
            //                score_selected, score_missing, score_illegible, score_invalid, score_expired,
            //                validation_status
            this.hasDatatableEntry = true;
            this.validationData = {
              nid: {
                selected: !!raw[0],
                reasons: {
                  missingDocument: !!raw[1],
                  illegibleDocument: !!raw[2],
                  invalidDocument: !!raw[3],
                  expiredDocument: !!raw[4]
                }
              },
              legalId: {
                selected: !!raw[5],
                reasons: {
                  missingDocument: !!raw[6],
                  illegibleDocument: !!raw[7],
                  invalidDocument: !!raw[8],
                  expiredDocument: !!raw[9]
                }
              },
              proofOfAddress: {
                selected: !!raw[10],
                reasons: {
                  missingDocument: !!raw[11],
                  illegibleDocument: !!raw[12],
                  invalidDocument: !!raw[13],
                  expiredDocument: !!raw[14]
                }
              },
              score: {
                selected: !!raw[15],
                reasons: {
                  missingDocument: !!raw[16],
                  illegibleDocument: !!raw[17],
                  invalidDocument: !!raw[18],
                  expiredDocument: !!raw[19]
                }
              },
              validationStatus: (raw[20] as ValidationStatus) ?? null
            };
          } catch {
            this.validationData = null;
          }
        } else {
          this.validationData = null;
        }
      });
  }

  /** Opens the Validate Customer Data dialog */
  validateDocumentation() {
    const dialogRef = this.dialog.open(ValidateCustomerDataDialogComponent, {
      data: this.validationData ? { ...this.validationData } : emptyCustomerDataValidation(),
      width: '680px',
      disableClose: false,
      panelClass: 'kyc-validation-dialog'
    });
    dialogRef.afterClosed().subscribe((result: CustomerDataValidation | undefined) => {
      if (!result) {
        return;
      }
      const payload = this.buildDatatablePayload(result);
      const clientId = this.clientViewData.id.toString();
      const save$ = this.hasDatatableEntry
        ? this.clientsService.editClientDatatableEntry(clientId, KYC_VALIDATION_DATATABLE, payload)
        : this.clientsService.addClientDatatableEntry(clientId, KYC_VALIDATION_DATATABLE, payload);
      save$
        .pipe(
          takeUntil(this.destroy$),
          catchError(() => {
            this.alertService.alert({
              type: 'error',
              message: this.translateService.instant('errors.validationSaveError')
            });
            return EMPTY;
          })
        )
        .subscribe(() => {
          this.hasDatatableEntry = true;
          this.validationData = result;
          this.alertService.alert({
            type: 'success',
            message: this.translateService.instant('labels.messages.validationSaved')
          });
        });
    });
  }

  /** Flattens CustomerDataValidation into a datatable payload */
  private buildDatatablePayload(v: CustomerDataValidation): Record<string, any> {
    return {
      nid_selected: v.nid.selected ? 1 : 0,
      nid_missing: v.nid.reasons.missingDocument ? 1 : 0,
      nid_illegible: v.nid.reasons.illegibleDocument ? 1 : 0,
      nid_invalid: v.nid.reasons.invalidDocument ? 1 : 0,
      nid_expired: v.nid.reasons.expiredDocument ? 1 : 0,
      legal_id_selected: v.legalId.selected ? 1 : 0,
      legal_id_missing: v.legalId.reasons.missingDocument ? 1 : 0,
      legal_id_illegible: v.legalId.reasons.illegibleDocument ? 1 : 0,
      legal_id_invalid: v.legalId.reasons.invalidDocument ? 1 : 0,
      legal_id_expired: v.legalId.reasons.expiredDocument ? 1 : 0,
      proof_selected: v.proofOfAddress.selected ? 1 : 0,
      proof_missing: v.proofOfAddress.reasons.missingDocument ? 1 : 0,
      proof_illegible: v.proofOfAddress.reasons.illegibleDocument ? 1 : 0,
      proof_invalid: v.proofOfAddress.reasons.invalidDocument ? 1 : 0,
      proof_expired: v.proofOfAddress.reasons.expiredDocument ? 1 : 0,
      score_selected: v.score.selected ? 1 : 0,
      score_missing: v.score.reasons.missingDocument ? 1 : 0,
      score_illegible: v.score.reasons.illegibleDocument ? 1 : 0,
      score_invalid: v.score.reasons.invalidDocument ? 1 : 0,
      score_expired: v.score.reasons.expiredDocument ? 1 : 0,
      validation_status: v.validationStatus ?? ''
    };
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

    // Determine report name dynamically based on legalForm.code
    let reportName = 'KYCReport';
    const legalFormCode = this.clientViewData?.legalForm?.code;
    if (legalFormCode === 'legalFormType.person') {
      reportName = 'KYCNaturalPerson';
    } else if (legalFormCode === 'legalFormType.entity') {
      reportName = 'KYCLegalPerson';
    }

    const formData = {
      'output-type': 'PDF',
      R_clientId: clientId
    };

    this.reportsService
      .getPentahoRunReportData(reportName, formData, tenantIdentifier, locale, dateFormat)
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
