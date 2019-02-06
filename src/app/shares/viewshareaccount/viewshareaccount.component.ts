/** Angular Imports */
import { Component, OnInit } from '@angular/core';

/** Routing Imports */
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Imports */
import { SharesService } from '../shares.service';

/** Custom Models */
import { PurchasedShare } from './purchased-shares.model';
import { Charge } from './charges.model';
import { Dividend } from './dividends.model';

/** Common model for similar tables */
export interface CommonTable {
  details: string;
  value: string;
}

/**
 * View Share Account Component
 */
@Component({
  selector: 'mifosx-viewshareaccount',
  templateUrl: './viewshareaccount.component.html',
  styleUrls: ['./viewshareaccount.component.scss']
})
export class ViewshareaccountComponent implements OnInit {

  shareAccountId: any;
  shareAccountDetails: any;
  date: any = {};
  staffData: any = {};
  status: any;
  choice: any;
  dividends: any;
  showDividends: any;
  dividendsTableDataSource: Dividend[] = [];
  chargeAction: any;
  chargePayAction: any;
  sharesPendingForApproval: any;
  purchasedSharesTableShow: any;
  purchasedSharesTableDataSource: PurchasedShare[] = [];
  purchasedShares: any;
  charges: any;
  chargeTableShow: any;
  chargeTableDataSource: Charge[] = [];
  accountTableDataSource: CommonTable[] = [];
  approveSharesTableDataSource: CommonTable[] = [];
  buttons: any = {};
  annualChargeId: any;
  displayedColumns: any = {
    purchasedSharesTable: ['transactionDate', 'transactionType', 'totalShares', 'purchasedOrRedeemedPrice', 'chargeAmount', 'amountRecievedOrReturned'],
    chargeTable: ['name', 'feeOrPenalty', 'paymentDueAt', 'calculationType', 'due', 'paid', 'waived', 'outstanding'],
    dividendsTable: ['transactionDate', 'amount', 'transactionRef', 'status'],
    accountTable: ['details', 'values'],
    approvedSharesTable: ['details', 'values']
  };

  /**
   * Retrieves the Share Account data.
   * Sets Button according to the status of account.
   * Adds data to the tables.
   * @param {Router} router Router.
   * @param {ActivatedRoute} route Activated Route.
   * @param {SharesService} SharesService Loan Service.
   */
  constructor(private router: Router,
              private route: ActivatedRoute,
              private sharesService: SharesService) {
    this.route.data.subscribe((shareAccountData: {
      shareAccount: any
    }) => {
      const data = shareAccountData.shareAccount;
      this.shareAccountDetails = data;
      this.convertDateArrayToObject('date');
      this.staffData.staffId = data.staffId;
      this.date.toDate = new Date();
      this.date.fromDate = new Date(data.timeline.activatedDate);
      this.status = data.status.value;

      this.accountTableDataSource = [
        { details: 'Activated On', value: this.shareAccountDetails.timeline.activatedDate || 'Not Activated' },
        { details: 'Currency', value: this.shareAccountDetails.currency.name },
        { details: 'External Id', value: this.shareAccountDetails.externalId },
        { details: 'Linked Savings Account(Dividend Posting)', value: this.shareAccountDetails.savingsAccountNumber }
      ];

      this.approveSharesTableDataSource = [
        { details: 'Approved Shares', value: this.shareAccountDetails.summary.totalApprovedShares },
        { details: 'Pending for Approval Shares', value: this.shareAccountDetails.summary.totalPendingForApprovalShares }
      ];

      if (this.shareAccountDetails.dividends && this.shareAccountDetails.dividends.length > 0) {
        this.dividends = this.shareAccountDetails.dividends;

        for (const dividend of this.dividends) {
          const dividendData: Dividend = {
            transactionDate: dividend.postedDate,
            amount: this.shareAccountDetails.currency.displaySymbol + dividend.amount,
            transactionRef: dividend.savingsTransactionId,
            status: dividend.status.value
          };
          this.dividendsTableDataSource.push(dividendData);
        }

        this.showDividends = true;
      }
      if (this.status === 'Submitted and pending approval' || this.status === 'Active' || this.status === 'Approved') {
        this.choice = true;
      }
      this.chargeAction = data.status.value === 'Submitted and pending approval' ? true : false;
      this.chargePayAction = data.status.value === 'Active' ? true : false;
      this.sharesPendingForApproval = false;

      if (this.shareAccountDetails.purchasedShares) {
        this.purchasedShares = this.shareAccountDetails.purchasedShares;
        for (let i = 0; i < this.shareAccountDetails.purchasedShares.length; i++) {
          if (
            this.shareAccountDetails.purchasedShares[i].status.code === 'purchasedSharesStatusType.applied' &&
            this.shareAccountDetails.purchasedShares[i].type.code === 'purchasedSharesType.purchased'
          ) {
            this.sharesPendingForApproval = true;
            break;
          }
        }

        for (const purchasedShare of this.purchasedShares) {
          const shareData: PurchasedShare = {
            transactionDate: purchasedShare.purchasedDate,
            transactionType:
              purchasedShare.type.value === 'Charge Payment'
                ? purchasedShare.type.value
                : purchasedShare.type.value + ' (' + purchasedShare.status.value + ')',
            totalShares: purchasedShare.numberOfShares,
            purchasedOrRedeemedPrice: purchasedShare.purchasedPrice
              ? this.shareAccountDetails.currency.displaySymbol + purchasedShare.purchasedPrice
              : '',
            chargeAmount:
              this.shareAccountDetails.currency.displaySymbol + purchasedShare.type.value === 'Charge Payment'
                ? purchasedShare.amount
                : purchasedShare.chargeAmount,
            amountRecievedOrReturned: this.shareAccountDetails.currency.displaySymbol + purchasedShare.amount
          };
          this.purchasedSharesTableDataSource.push(shareData);
        }

        this.purchasedSharesTableShow = true;
      } else {
        this.purchasedSharesTableShow = false;
      }
      if (this.shareAccountDetails.charges && this.shareAccountDetails.charges.length !== 0) {
        this.charges = this.shareAccountDetails.charges;
        const shareAccountCharge = this.charges.filter((charge: any) => charge.isActive === true);

        for (const charge of shareAccountCharge) {
          const chargeData: Charge = {
            name: charge.name,
            feeOrPenalty: charge.penalty ? 'penalty' : 'fee',
            paymentDueAt: charge.chargeTimeType.value,
            calculationType: charge.chargeCalculationType.value,
            due: charge.currency.displaySymbol + charge.amount,
            paid: charge.currency.displaySymbol + charge.amountPaid,
            waived: charge.currency.displaySymbol + charge.amountWaived,
            outstanding: charge.currency.displaySymbol + charge.amountOutstanding,
          };
          this.chargeTableDataSource.push(chargeData);
        }

        this.chargeTableShow = true;
      } else {
        this.chargeTableShow = false;
      }
      if (data.status.value === 'Submitted and pending approval') {
        this.buttons = {
          singlebuttons: [
            {
              name: 'Modify Application',
              icon: 'fa fa-pencil '
            },
            {
              name: 'Approve',
              icon: 'fa fa-check'
            }
          ],
          options: [
            {
              name: 'Reject'
            },
            {
              name: 'Delete'
            }
          ]
        };
      }

      if (data.status.value === 'Approved') {
        this.buttons = {
          singlebuttons: [
            {
              name: 'Undo Approval',
              icon: 'fa fa-undo'
            },
            {
              name: 'Activate',
              icon: 'fa fa-check'
            }
          ]
        };
      }

      if (data.status.value === 'Active') {
        if (this.sharesPendingForApproval) {
          this.buttons = {
            singlebuttons: [
              {
                name: 'Apply Additional Shares',
                icon: 'fa fa-arrow-right'
              },
              {
                name: 'Approve Additional Shares',
                icon: 'fa fa-arrow-right'
              },
              {
                name: 'Reject Additional Shares',
                icon: 'fa fa-arrow-right'
              },
              {
                name: 'Redeem Shares',
                icon: 'fa fa-arrow-left'
              }
            ],
            options: [
              {
                name: 'Close'
              }
            ]
          };
        } else {
          this.buttons = {
            singlebuttons: [
              {
                name: 'Apply Additional Shares',
                icon: 'fa fa-arrow-right'
              },
              {
                name: 'Redeem Shares',
                icon: 'fa fa-arrow-left'
              }
            ],
            options: [
              {
                name: 'Close'
              }
            ]
          };
        }

        if (data.charges && data.charges.length !== 0) {
          for (let i = 0; i < this.charges.length; i++) {
            if (this.charges[i].name === 'Annual fee - INR') {
              this.buttons.options.push({
                name: 'applyAnnualFees'
              });
              this.annualChargeId = this.charges[i].id;
            }
          }
        }
      }
    });
  }

  /**
   * Gets Share Account Id from url params.
   */
  ngOnInit() {
    this.route.params.subscribe(
      params => {
        this.shareAccountId = params['shareAccountId'];
    });
  }

  /**
   * For perform specific function according to the button clicked.
   * @param eventName Name of the button clicked.
   * @param accountId Share Account Id
   */
  clickEvent(eventName: any, accountId: any) {
    eventName = eventName || '';
    switch (eventName) {
      case 'Modify Application':
        this.router.navigate(['/editshareaccount/' + accountId]);
        break;
      case 'Approve':
        this.router.navigate(['/shareaccount/' + accountId + '/approve']);
        break;
      case 'Reject':
        this.router.navigate(['/shareaccount/' + accountId + '/reject']);
        break;
      case 'Delete':
        this.sharesService.deleteShareAccount(accountId).subscribe((data: any) => {
          let destination = '/viewgroup/' + data.groupId;
          if (data.clientId) {
            destination = '/viewclient/' + data.clientId;
          }
          this.router.navigate([destination]);
        });
        break;
      case 'Undo Approval':
        this.router.navigate(['/shareaccount/' + accountId + '/undoapproval']);
        break;
      case 'Activate':
        this.router.navigate(['/shareaccount/' + accountId + '/activate']);
        break;
      case 'Apply Additional Shares':
        this.router.navigate(['/shareaccount/' + accountId + '/applyadditionalshares']);
        break;
      case 'Approve Additional Shares':
        this.router.navigate(['/shareaccount/' + accountId + '/approveadditionalshares']);
        break;
      case 'Reject Additional Shares':
        this.router.navigate(['/shareaccount/' + accountId + '/rejectadditionalshares']);
        break;
      case 'Redeem Shares':
        this.router.navigate(['/shareaccount/' + accountId + '/redeemshares']);
        break;
      case 'Add Charge':
        this.router.navigate(['/shareaccount/' + accountId + '/charges']);
        break;
      case 'Close':
        this.router.navigate(['/shareaccount/' + accountId + '/close']);
        break;
      case 'assignSavingsOfficer':
        this.router.navigate(['/assignshareofficer/' + accountId]);
        break;
      case 'unAssignSavingsOfficer':
        this.router.navigate(['/unassignshareofficer/' + accountId]);
        break;
    }
  }

  /**
   * To Convert Date Array to A Date Object.
   * @param dateFieldName Name of the date data field.
   */
  convertDateArrayToObject(dateFieldName: any) {
    if (this.shareAccountDetails.transactions) {
      for (let i = 0; i < this.shareAccountDetails.transactions.length; i++) {
        this.shareAccountDetails.transactions[i][dateFieldName] = new Date(this.shareAccountDetails.transactions[i].date);
      }
    }
  }
}
