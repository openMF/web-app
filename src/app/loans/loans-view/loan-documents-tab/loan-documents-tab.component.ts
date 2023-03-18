/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** Custom Services */
import { environment } from 'environments/environment';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Overdue charges tab component
 */
@Component({
  selector: 'mifosx-loan-documents-tab',
  templateUrl: './loan-documents-tab.component.html',
  styleUrls: ['./loan-documents-tab.component.scss']
})
export class LoanDocumentsTabComponent implements OnInit {

  /** Stores the resolved loan documents data */
  entityDocuments: any;
  /** Loan account Id */
  entityId: string;
  entityType = 'loans';

  /**
   * Retrieves the loans data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,
    private loansService: LoansService,
    private settingsService: SettingsService) {
      this.entityId = this.route.parent.snapshot.params['loanId'];

      this.route.data.subscribe((data: { loanDocuments: any }) => {
        this.getLoanDocumentsData(data.loanDocuments);
      });
  }

  ngOnInit() { }

  getLoanDocumentsData(data: any) {
    data.forEach((ele: any) => {
      ele.docUrl = this.settingsService.serverUrl + '/loans/' + ele.parentEntityId + '/documents/' + ele.id + '/attachment?tenantIdentifier=' + environment.fineractPlatformTenantId;
      if (ele.fileName) {
        if (ele.fileName.toLowerCase().indexOf('.jpg') !== -1 || ele.fileName.toLowerCase().indexOf('.jpeg') !== -1 || ele.fileName.toLowerCase().indexOf('.png') !== -1) {
          ele.fileIsImage = true;
        }
      }
      if (ele.type) {
        if (ele.type.toLowerCase().indexOf('image') !== -1) {
          ele.fileIsImage = true;
        }
      }
    });
    this.entityDocuments = data;
  }

  downloadDocument(documentId: string) {
    this.loansService.downloadLoanDocument(this.entityId, documentId).subscribe(res => {
      const url = window.URL.createObjectURL(res);
      window.open(url);
    });
  }

  uploadDocument(formData: FormData): any {
    return this.loansService.loadLoanDocument(this.entityId, formData);
  }

  deleteDocument(documentId: any) {
    this.loansService.deleteLoanDocument(this.entityId, documentId).subscribe((res: any) => {});
  }

}
