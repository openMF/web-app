/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Dialogs */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { SharesService } from '../shares.service';

/** Custom Buttons Configuration */
import { SharesButtonsConfiguration } from './shares-buttons.config';
import {
  MatCard,
  MatCardHeader,
  MatCardTitleGroup,
  MatCardMdImage,
  MatCardTitle,
  MatCardContent
} from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { LongTextComponent } from '../../shared/long-text/long-text.component';
import { AccountNumberComponent } from '../../shared/account-number/account-number.component';
import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { StatusLookupPipe } from '../../pipes/status-lookup.pipe';
import { FormatNumberPipe } from '../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Shares Account View
 */
@Component({
  selector: 'mifosx-shares-account-view',
  templateUrl: './shares-account-view.component.html',
  styleUrls: ['./shares-account-view.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCardHeader,
    MatCardTitleGroup,
    MatCardMdImage,
    MatTooltip,
    MatCardTitle,
    NgClass,
    LongTextComponent,
    AccountNumberComponent,
    MatIconButton,
    MatMenuTrigger,
    MatIcon,
    FaIconComponent,
    MatMenu,
    MatMenuItem,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet,
    StatusLookupPipe,
    FormatNumberPipe
  ]
})
export class SharesAccountViewComponent implements OnInit {
  /** Shares Account Data */
  sharesAccountData: any;
  /** Button Configurations */
  buttonConfig: SharesButtonsConfiguration;

  entityType: string;

  /**
   * Fetches shares account data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SharesService} sharesService Shares Service
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sharesService: SharesService,
    public dialog: MatDialog
  ) {
    this.route.data.subscribe((data: { sharesAccountData: any }) => {
      this.sharesAccountData = data.sharesAccountData;
    });
  }

  ngOnInit() {
    this.setConditionalButtons();
    if (this.router.url.includes('clients')) {
      this.entityType = 'Client';
    } else if (this.router.url.includes('groups')) {
      this.entityType = 'Group';
    } else if (this.router.url.includes('centers')) {
      this.entityType = 'Center';
    }
  }

  /**
   * Adds options to button config. conditionaly.
   */
  setConditionalButtons() {
    const status = this.sharesAccountData.status.value;
    this.buttonConfig = new SharesButtonsConfiguration(status);
    if (this.sharesAccountData.charges) {
      const charges: any[] = this.sharesAccountData.charges;
      charges.forEach((charge: any) => {
        if (charge.name === 'Annual fee - INR') {
          this.buttonConfig.addOption({
            name: 'Apply Anuual Fees',
            taskPermissionName: 'APPLYANNUALFEE_SAVINGSACCOUNT'
          });
        }
      });
    }
    if (status === 'Active') {
      const purchasedShares: any[] = this.sharesAccountData.purchasedShares;
      let sharesPendingForApproval = false;
      purchasedShares.forEach((share: any) => {
        if (
          share.status.code === 'purchasedSharesStatusType.applied' &&
          share.type.code === 'purchasedSharesType.purchased'
        ) {
          sharesPendingForApproval = true;
        }
      });
      if (!sharesPendingForApproval) {
        this.buttonConfig.removeButton('Approve Additional Shares');
        this.buttonConfig.removeButton('Reject Additional Shares');
      }
    }
  }

  /**
   * Performs button action
   * @param {string} name Action name
   */
  doAction(name: string) {
    switch (name) {
      case 'Approve':
      case 'Reject':
      case 'Close':
      case 'Activate':
      case 'Undo Approval':
      case 'Apply Additional Shares':
      case 'Redeem Shares':
      case 'Approve Additional Shares':
      case 'Reject Additional Shares':
        this.router.navigate([`actions/${name}`], { relativeTo: this.route });
        break;
      case 'Modify Application':
        this.router.navigate(['edit'], { relativeTo: this.route });
        break;
      case 'Delete':
        this.deleteSharesAccount();
        break;
    }
  }

  /**
   * Deletes Shares Account.
   */
  private deleteSharesAccount() {
    const deleteSharesAccountDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `shares account with id: ${this.sharesAccountData.id}` }
    });
    deleteSharesAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.sharesService.deleteSharesAccount(this.sharesAccountData.id).subscribe(() => {
          this.router.navigate(['../../'], { relativeTo: this.route });
        });
      }
    });
  }
}
