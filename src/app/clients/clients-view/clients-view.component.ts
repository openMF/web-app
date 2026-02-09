/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';

/** Custom Dialogs */
import { UnassignStaffDialogComponent } from './custom-dialogs/unassign-staff-dialog/unassign-staff-dialog.component';
import { UploadSignatureDialogComponent } from './custom-dialogs/upload-signature-dialog/upload-signature-dialog.component';
import { ViewSignatureDialogComponent } from './custom-dialogs/view-signature-dialog/view-signature-dialog.component';
import { DeleteSignatureDialogComponent } from './custom-dialogs/delete-signature-dialog/delete-signature-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { UploadImageDialogComponent } from './custom-dialogs/upload-image-dialog/upload-image-dialog.component';
import { CaptureImageDialogComponent } from './custom-dialogs/capture-image-dialog/capture-image-dialog.component';

/** Custom Services */
import { ClientsService } from '../clients.service';
import { LegalFormId } from '../models/legal-form.enum';
import {
  MatCard,
  MatCardHeader,
  MatCardTitleGroup,
  MatCardMdImage,
  MatCardTitle,
  MatCardSubtitle,
  MatCardContent
} from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { EntityNameComponent } from '../../shared/entity-name/entity-name.component';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AccountNumberComponent } from '../../shared/account-number/account-number.component';
import { ExternalIdentifierComponent } from '../../shared/external-identifier/external-identifier.component';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { StatusLookupPipe } from '../../pipes/status-lookup.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { formatTabLabel } from 'app/shared/utils/format-tab-label.util';

@Component({
  selector: 'mifosx-clients-view',
  templateUrl: './clients-view.component.html',
  styleUrls: ['./clients-view.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardHeader,
    MatCardTitleGroup,
    MatCardMdImage,
    MatTooltip,
    MatCardTitle,
    NgClass,
    EntityNameComponent,
    MatIconButton,
    MatMenuTrigger,
    MatIcon,
    FaIconComponent,
    MatCardSubtitle,
    AccountNumberComponent,
    ExternalIdentifierComponent,
    MatMenu,
    MatMenuItem,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet,
    StatusLookupPipe,
    DateFormatPipe
  ]
})
export class ClientsViewComponent implements OnInit {
  complianceHideClientData = environment.complianceHideClientData;
  /**
   * Mask a string, keeping first and last letter, masking the rest with *
   */
  maskName(name: string): string {
    if (!name) return '';
    return name
      .trim()
      .split(/(\s+)/)
      .map((word) => {
        if (!word.trim()) return word;
        if (word.length <= 2) return word[0] + '*';
        return word[0] + '*'.repeat(word.length - 2) + word[word.length - 1];
      })
      .join('');
  }

  /**
   * Mask external id, mobile, etc (show only first char, rest as *)
   */
  maskValue(val: string): string {
    if (!val) return '';
    if (val.length <= 2) return val[0] + '*';
    return val[0] + '*'.repeat(val.length - 1);
  }

  /**
   * Mask email: v********@f*******
   */
  maskEmail(email: string): string {
    if (!email) return '';
    const [
      user,
      domain
    ] = email.split('@');
    if (!user || !domain || user.length < 1) return this.maskValue(email);
    let maskedUser = user.length > 1 ? user[0] + '*'.repeat(user.length - 1) : user[0] + '*';
    const domainLabel = domain.split('.')[0] || '';
    const domainMaskLen = Math.max(0, domainLabel.length - 1);
    let maskedDomain = domainLabel.length > 0 ? domainLabel[0] + '*'.repeat(domainMaskLen) : '';
    let domainRest = '';
    if (domain.length > domainLabel.length) {
      domainRest = domain.substring(domainLabel.length);
    }
    if (!maskedDomain) return this.maskValue(email);
    return maskedUser + '@' + maskedDomain + domainRest;
  }
  formatTabLabel(label: string): string {
    return formatTabLabel(label);
  }
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientsService = inject(ClientsService);
  private _sanitizer = inject(DomSanitizer);
  dialog = inject(MatDialog);

  clientViewData: any;
  clientDatatables: any;
  clientImage: any;
  clientTemplateData: any;

  constructor() {
    this.route.data.subscribe((data: { clientViewData: any; clientTemplateData: any; clientDatatables: any }) => {
      this.clientViewData = data.clientViewData;
      this.clientDatatables = this.filterDatatablesByClientSubtype(
        data.clientDatatables,
        data.clientViewData?.legalForm?.id
      );
      this.clientTemplateData = data.clientTemplateData;
    });
  }

  /**
   * Filters datatables based on the client's legal form (Person or Entity).
   * Datatables without an entitySubType are kept visible for all client types.
   */
  private filterDatatablesByClientSubtype(datatables: any[], legalFormId: number): any[] {
    if (!datatables || !legalFormId) {
      return datatables || [];
    }
    const subtype = legalFormId === LegalFormId.PERSON ? 'person' : 'entity';
    return datatables.filter((dt: any) => !dt.entitySubType || dt.entitySubType.toLowerCase() === subtype);
  }

  ngOnInit() {
    this.clientsService.getClientProfileImage(this.clientViewData.id).subscribe({
      next: (base64Image: any) => {
        // If base64Image is null, client has no profile image
        if (base64Image) {
          this.clientImage = this._sanitizer.bypassSecurityTrustResourceUrl(base64Image);
        } else {
          this.clientImage = null;
        }
      },
      error: (error: any) => {
        // Handle any unexpected errors
        console.error('Error loading client profile image:', error);
        this.clientImage = null;
      }
    });
  }

  isActive(): boolean {
    return this.clientViewData.status.value === 'Active';
  }

  /**
   * Performs action button/option action.
   * @param {string} name action name.
   */
  doAction(name: string) {
    switch (name) {
      case 'Assign Staff':
      case 'Close':
      case 'Survey':
      case 'Reject':
      case 'Activate':
      case 'Withdraw':
      case 'Update Default Savings':
      case 'Transfer Client':
      case 'Undo Transfer':
      case 'Accept Transfer':
      case 'Reject Transfer':
      case 'Reactivate':
      case 'Undo Rejection':
      case 'Add Charge':
      case 'Create Collateral':
      case 'Client Screen Reports':
        this.router.navigate([`actions/${name}`], { relativeTo: this.route });
        break;
      case 'Unassign Staff':
        this.unassignStaff();
        break;
      case 'Delete':
        this.deleteClient();
        break;
      case 'View Signature':
        this.viewSignature();
        break;
      case 'Upload Signature':
        this.uploadSignature();
        break;
      case 'Delete Signature':
        this.deleteSignature();
        break;
      case 'Capture Image':
        this.captureProfileImage();
        break;
      case 'Upload Image':
        this.uploadProfileImage();
        break;
      case 'Delete Image':
        this.deleteProfileImage();
        break;
      case 'Create Standing Instructions':
        const createStandingInstructionsQueryParams: any = {
          officeId: this.clientViewData.officeId,
          accountType: 'fromsavings'
        };
        this.router.navigate(['standing-instructions/create-standing-instructions'], {
          relativeTo: this.route,
          queryParams: createStandingInstructionsQueryParams
        });
        break;
      case 'View Standing Instructions':
        const viewStandingInstructionsQueryParams: any = {
          officeId: this.clientViewData.officeId,
          accountType: 'fromsavings'
        };
        this.router.navigate(['standing-instructions/list-standing-instructions'], {
          relativeTo: this.route,
          queryParams: viewStandingInstructionsQueryParams
        });
        break;
    }
  }

  /**
   * Refetches data for the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  reload() {
    const url: string = this.router.url;
    this.router.navigateByUrl(`/clients`, { skipLocationChange: true }).then(() => this.router.navigate([url]));
  }

  /**
   * Deletes the client
   */
  private deleteClient() {
    const deleteClientDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `client with id: ${this.clientViewData.id}` }
    });
    deleteClientDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientsService.deleteClient(this.clientViewData.id).subscribe(() => {
          this.router.navigate(['/clients'], { relativeTo: this.route });
        });
      }
    });
  }

  /**
   * Unassign's the client's staff.
   */
  private unassignStaff() {
    const unAssignStaffDialogRef = this.dialog.open(UnassignStaffDialogComponent);
    unAssignStaffDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.clientsService
          .executeClientCommand(this.clientViewData.id, 'unassignStaff', { staffId: this.clientViewData.staffId })
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Shows client signature in a dialog
   */
  private viewSignature() {
    this.clientsService.getClientDocuments(this.clientViewData.id).subscribe((documents: any) => {
      const viewSignatureDialogRef = this.dialog.open(ViewSignatureDialogComponent, {
        data: {
          documents: documents,
          id: this.clientViewData.id
        }
      });
      viewSignatureDialogRef.afterClosed().subscribe((response: any) => {
        if (response.upload) {
          this.uploadSignature();
        } else if (response.delete) {
          this.deleteSignature();
        }
      });
    });
  }

  /**
   * Uploads client signature
   */
  private uploadSignature() {
    const uploadSignatureDialogRef = this.dialog.open(UploadSignatureDialogComponent);
    uploadSignatureDialogRef.afterClosed().subscribe((signature: File) => {
      if (signature) {
        this.clientsService.uploadClientSignatureImage(this.clientViewData.id, signature).subscribe(() => {
          this.reload();
        });
      }
    });
  }

  /**
   * Deletes client signature
   */
  private deleteSignature() {
    this.clientsService.getClientDocuments(this.clientViewData.id).subscribe((documents: any) => {
      const deleteSignatureDialogRef = this.dialog.open(DeleteSignatureDialogComponent, {
        data: documents
      });
      deleteSignatureDialogRef.afterClosed().subscribe((response: any) => {
        if (response.delete) {
          this.clientsService.deleteClientDocument(this.clientViewData.id, response.id).subscribe(() => {
            this.reload();
          });
        } else if (response.upload) {
          this.uploadSignature();
        }
      });
    });
  }

  /**
   * Captures clients profile image.
   */
  private captureProfileImage() {
    const captureImageDialogRef = this.dialog.open(CaptureImageDialogComponent);
    captureImageDialogRef.afterClosed().subscribe((imageURL: string) => {
      if (imageURL) {
        this.clientsService.uploadCapturedClientProfileImage(this.clientViewData.id, imageURL).subscribe(() => {
          this.reload();
        });
      }
    });
  }

  /**
   * Uploads the clients image.
   */
  private uploadProfileImage() {
    const uploadImageDialogRef = this.dialog.open(UploadImageDialogComponent);
    uploadImageDialogRef.afterClosed().subscribe((image: File) => {
      if (image) {
        this.clientsService.uploadClientProfileImage(this.clientViewData.id, image).subscribe(() => {
          this.reload();
        });
      }
    });
  }

  /**
   * Deletes the client image.
   */
  private deleteProfileImage() {
    const deleteClientImageDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `the profile image of ${this.clientViewData.displayName}` }
    });
    deleteClientImageDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientsService.deleteClientProfileImage(this.clientViewData.id).subscribe(() => {
          this.reload();
        });
      }
    });
  }
}
