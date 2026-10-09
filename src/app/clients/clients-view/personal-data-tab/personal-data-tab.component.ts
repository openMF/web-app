/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

/** Custom Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { LegalFormId } from 'app/clients/models/legal-form.enum';
import { ClientsService, ClientIdentifierPayload } from 'app/clients/clients.service';
import { MatIcon } from '@angular/material/icon';
import { ReportsService } from 'app/reports/reports.service';
import { SettingsService } from 'app/settings/settings.service';
import { AlertService } from 'app/core/alert/alert.service';
import { SystemService } from 'app/system/system.service';
import { environment } from 'environments/environment';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { EMPTY, Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Dates } from 'app/core/utils/dates';
import {
  CustomerDataValidation,
  KYC_VALIDATION_DATATABLE,
  KYC_VALIDATION_DATATABLE_ENTITY,
  KYC_VALIDATION_CONFIG_NAME,
  ValidationStatus,
  emptyCustomerDataValidation,
  DOCUMENT_DATA_TYPES,
  DOCUMENT_REASON_TYPES
} from 'app/clients/models/document-validation.model';
import { ValidateCustomerDataDialogComponent } from '../custom-dialogs/validate-customer-data-dialog/validate-customer-data-dialog.component';
import { PersonalDataViewService } from './personal-data-view.service';
import { PersonalDataViewModel } from './personal-data-view.model';
import { PersonProductionPersonalDataComponent } from './person-production-personal-data/person-production-personal-data.component';
import { EntityProductionPersonalDataComponent } from './entity-production-personal-data/entity-production-personal-data.component';
import { IdentitiesTabComponent } from '../identities-tab/identities-tab.component';
import { DocumentsTabComponent } from '../documents-tab/documents-tab.component';

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
  legalForm?: { id?: number | string; code?: string; name?: string; value?: string };
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
    MatIcon,
    PersonProductionPersonalDataComponent,
    EntityProductionPersonalDataComponent,
    IdentitiesTabComponent,
    DocumentsTabComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalDataTabComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private clientsService = inject(ClientsService);
  private sanitizer = inject(DomSanitizer);
  private reportsService = inject(ReportsService);
  private settingsService = inject(SettingsService);
  private alertService = inject(AlertService);
  private systemService = inject(SystemService);
  private personalDataViewService = inject(PersonalDataViewService);
  private translateService = inject(TranslateService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private dateUtils = inject(Dates);

  /** Client View Data */
  clientViewData!: ClientViewData;
  /** Production mode flag */
  productionMode = environment.productionMode === true;
  /** Consolidated production Personal Data view model */
  productionViewModel$: Observable<PersonalDataViewModel | null> = of(null);
  /** PDF Display Control */
  showPdf = false;
  pdfUrl: SafeResourceUrl | null = null;
  rawPdfUrl: string | null = null;

  /** Whether the KYC validation feature is enabled via global configuration */
  isKycEnabled = false;
  /** Current document validation state */
  validationData: CustomerDataValidation | null = null;
  /** True when the datatable already has a row (drives add vs edit) */
  private hasDatatableEntry = false;
  /** Expose ValidationStatus enum to template */
  readonly ValidationStatus = ValidationStatus;

  /** Whether the global config check has completed */
  private configLoaded = false;
  /** Client Identities for description update */
  private clientIdentities: any[] = [];

  constructor() {
    this.systemService
      .getConfigurations()
      .pipe(
        catchError(() => {
          this.isKycEnabled = false;
          this.configLoaded = true;
          return EMPTY;
        })
      )
      .subscribe((configs: any) => {
        const kycConfig = configs?.globalConfiguration?.find((c: any) => c.name === KYC_VALIDATION_CONFIG_NAME);
        this.isKycEnabled = kycConfig?.enabled ?? false;
        this.configLoaded = true;
        this.loadValidationData();
      });

    this.route.parent.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { clientViewData: ClientViewData; clientDatatables?: any[] }) => {
        this.clientViewData = data.clientViewData;
        this.validationData = null;
        this.hasDatatableEntry = false;
        this.loadProductionViewModel(data.clientDatatables || []);
        if (this.configLoaded) {
          this.loadValidationData();
        }
      });

    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { clientIdentities: any[] }) => {
      this.clientIdentities = data.clientIdentities || [];
    });
  }

  private loadProductionViewModel(clientDatatables: any[]) {
    if (!this.productionMode || !this.clientViewData?.id) {
      this.productionViewModel$ = of(null);
      return;
    }
    this.productionViewModel$ = this.personalDataViewService
      .load(this.clientViewData.id.toString(), clientDatatables, this.isLegalEntity())
      .pipe(catchError(() => of(null)));
  }

  /** Returns the correct datatable name based on the client's legal form */
  private getKycDatatableName(): string {
    return this.isLegalEntity() ? KYC_VALIDATION_DATATABLE_ENTITY : KYC_VALIDATION_DATATABLE;
  }

  /** Loads saved validation data from the datatable */
  private loadValidationData() {
    if (!this.clientViewData?.id || !this.isKycEnabled) {
      return;
    }
    const datatableName = this.getKycDatatableName();
    this.clientsService
      .getClientDatatable(this.clientViewData.id.toString(), datatableName)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
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
                selected: !!raw[1],
                reasons: {
                  missingDocument: !!raw[2],
                  illegibleDocument: !!raw[3],
                  invalidDocument: !!raw[4],
                  expiredDocument: !!raw[5]
                }
              },
              legalId: {
                selected: !!raw[6],
                reasons: {
                  missingDocument: !!raw[7],
                  illegibleDocument: !!raw[8],
                  invalidDocument: !!raw[9],
                  expiredDocument: !!raw[10]
                }
              },
              proofOfAddress: {
                selected: !!raw[11],
                reasons: {
                  missingDocument: !!raw[12],
                  illegibleDocument: !!raw[13],
                  invalidDocument: !!raw[14],
                  expiredDocument: !!raw[15]
                }
              },
              score: {
                selected: !!raw[16],
                reasons: {
                  missingDocument: !!raw[17],
                  illegibleDocument: !!raw[18],
                  invalidDocument: !!raw[19],
                  expiredDocument: !!raw[20]
                }
              },
              validationStatus: (raw[21] as ValidationStatus) ?? null
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
      const datatableName = this.getKycDatatableName();
      const save$ = this.hasDatatableEntry
        ? this.clientsService.editClientDatatableEntry(clientId, datatableName, payload)
        : this.clientsService.addClientDatatableEntry(clientId, datatableName, payload);
      save$
        .pipe(
          takeUntilDestroyed(this.destroyRef),
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
          this.updateIdentityDescriptions(result);
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
    const legalForm = this.clientViewData?.legalForm;
    const legalFormId = Number(legalForm?.id);
    const legalFormValue = `${legalForm?.code || legalForm?.value || legalForm?.name || ''}`.toLowerCase();
    if (legalFormId === LegalFormId.ENTITY || legalFormValue.includes('entity')) {
      return false;
    }
    return legalFormId === LegalFormId.PERSON || legalFormValue.includes('person');
  }

  /**
   * Check if client is a legal entity (organization)
   */
  isLegalEntity(): boolean {
    const legalForm = this.clientViewData?.legalForm;
    const legalFormId = Number(legalForm?.id);
    const legalFormValue = `${legalForm?.code || legalForm?.value || legalForm?.name || ''}`.toLowerCase();
    return legalFormId === LegalFormId.ENTITY || legalFormValue.includes('entity');
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
        takeUntilDestroyed(this.destroyRef),
        catchError((error: any): any => {
          console.error('Document preview failed', error);
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
    if (this.rawPdfUrl) {
      URL.revokeObjectURL(this.rawPdfUrl);
      this.rawPdfUrl = null;
    }
    this.pdfUrl = null;
  }

  /** Managed suffix marker used to identify the validation-appended portion of a description */
  private static readonly VALIDATION_SUFFIX_MARKER = ' [KYC: ';

  /**
   * Updates identity descriptions by replacing (not just appending) negative validation reasons.
   * Builds a managed suffix like " [KYC: Missing document, Invalid document]" and replaces
   * any previous suffix, preserving the user's original description text.
   */
  private updateIdentityDescriptions(result: CustomerDataValidation) {
    if (!this.clientIdentities || this.clientIdentities.length === 0) return;

    const dataTypes = DOCUMENT_DATA_TYPES;
    const reasonTypes = DOCUMENT_REASON_TYPES;
    const updates: Observable<any>[] = [];
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;

    for (const dt of dataTypes) {
      const docVal = result[dt.key] as any;
      if (!docVal || !docVal.reasons) continue;

      // Find an identity whose documentType name matches the validation key or label
      const dtLabel = this.translateService.instant(dt.labelKey).toLowerCase();
      const matchingIdentity = this.clientIdentities.find((id: any) => {
        const typeName = id.documentType?.name?.toLowerCase() || '';
        return typeName.includes(dt.key.toLowerCase()) || typeName.includes(dtLabel);
      });

      if (matchingIdentity) {
        // Collect active reasons
        const activeReasons: string[] = [];
        for (const rt of reasonTypes) {
          if (docVal.reasons[rt.key]) {
            activeReasons.push(this.translateService.instant(rt.labelKey));
          }
        }

        // Strip any existing managed suffix from the current description
        const currentDesc = matchingIdentity.description || '';
        const markerIdx = currentDesc.indexOf(PersonalDataTabComponent.VALIDATION_SUFFIX_MARKER);
        const baseDesc = markerIdx >= 0 ? currentDesc.substring(0, markerIdx) : currentDesc;

        // Build new description: base + managed suffix (only if there are active reasons)
        const newDesc = activeReasons.length > 0 ? `${baseDesc} [KYC: ${activeReasons.join(', ')}]` : baseDesc;

        // Only update if the description actually changed
        if (newDesc !== currentDesc) {
          const identifierData: ClientIdentifierPayload = {
            documentTypeId: matchingIdentity.documentType.id,
            documentKey: matchingIdentity.documentKey,
            description: newDesc,
            dateFormat,
            locale,
            issuanceDate: matchingIdentity.issuanceDate
              ? this.dateUtils.formatDate(matchingIdentity.issuanceDate, dateFormat)
              : null,
            expiryDate: matchingIdentity.expiryDate
              ? this.dateUtils.formatDate(matchingIdentity.expiryDate, dateFormat)
              : null
          };

          const clientIdStr = this.clientViewData.id.toString();
          updates.push(
            this.clientsService.editClientIdentifier(clientIdStr, matchingIdentity.id, identifierData).pipe(
              map(() => ({ success: true, identity: matchingIdentity, newDesc })),
              catchError((err) => {
                console.error(`Failed to update identity ${matchingIdentity.id}`, err);
                return of({ success: false, identity: matchingIdentity, newDesc });
              })
            )
          );
        }
      }
    }

    if (updates.length > 0) {
      forkJoin(updates).subscribe((results: any[]) => {
        let allSuccess = true;

        // Synchronize local state only for the requests that actually succeeded
        results.forEach((r) => {
          if (r.success) {
            r.identity.description = r.newDesc;
          } else {
            allSuccess = false;
          }
        });

        if (allSuccess) {
          this.alertService.alert({
            type: 'success',
            message: this.translateService.instant('labels.messages.identityDescriptionsUpdated')
          });
        } else {
          this.alertService.alert({
            type: 'error',
            message: this.translateService.instant('labels.messages.identityDescriptionsUpdateFailed')
          });
        }
      });
    }
  }
}
