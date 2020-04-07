/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SharesService } from '../shares.service';

/**
 * View share account component.
 */
@Component({
  selector: 'mifosx-view-share-account',
  templateUrl: './view-share-account.component.html',
  styleUrls: ['./view-share-account.component.scss']
})
export class ViewShareAccountComponent implements OnInit {

  /*Share Account Data*/
  shareAccountData: any;

  choice: any;
  status: any;
  chargeAction: any;
  chargePayAction: any;
  sharesPendingForApproval: any;
  annualChargeId: any;

  /*Buttons*/
  buttons: any = {};

  /*Data Source for tables*/
  purchasedSharesTableDataSource: Array<any> = [];
  chargeTableDataSource: Array<any> = [];
  dividendsTableDataSource: Array<any> = [];

  /*Displayed Columns*/
  purchasedSharesTableColumns: string[] =  ['transactionDate', 'transactionType', 'totalShares', 'purchasedOrRedeemedPrice', 'chargeAmount', 'amountRecievedOrReturned'];
  chargesTableColumns: string[] =  ['name', 'feeOrPenalty', 'paymentDueAt', 'calculationType', 'due', 'paid', 'waived', 'outstanding'];
  dividendsTableColumns: string[] =  ['transactionDate', 'amount', 'transactionRef', 'status'];

  /**
   * Retrieves the shares account data from `resolve`.
   * @param {SharesService} sharesService Shares Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private route: ActivatedRoute,
              private sharesService: SharesService,
              private router: Router) {
    this.route.data.subscribe((data: { shareAccountData: any}) => {
      this.shareAccountData = data.shareAccountData;
    });

    this.status = this.shareAccountData.status.value;

    if (this.status === 'Submitted and pending approval' || this.status === 'Active' || this.status === 'Approved') {
      this.choice = true;
    }

    this.chargeAction = this.shareAccountData.status.value === 'Submitted and pending approval' ? true : false;
    this.chargePayAction = this.shareAccountData.status.value === 'Active' ? true : false;
    this.sharesPendingForApproval = false;

    /*Initialising purchased shares table data source.*/
    if (this.shareAccountData.purchasedShares.length > 0) {
      for (let i = 0; i < this.shareAccountData.purchasedShares.length; i++) {
        if (
          this.shareAccountData.purchasedShares[i].status.code === 'purchasedSharesStatusType.applied' &&
          this.shareAccountData.purchasedShares[i].type.code === 'purchasedSharesType.purchased'
        ) {
          this.sharesPendingForApproval = true;
          break;
        }
      }

      for (const purchasedShare of this.shareAccountData.purchasedShares) {
        const shareData: any = {
          transactionDate: purchasedShare.purchasedDate,
          transactionType:
            purchasedShare.type.value === 'Charge Payment'
              ? purchasedShare.type.value
              : purchasedShare.type.value + ' (' + purchasedShare.status.value + ')',
          totalShares: purchasedShare.numberOfShares,
          purchasedOrRedeemedPrice: purchasedShare.purchasedPrice
            ? this.shareAccountData.currency.displaySymbol + purchasedShare.purchasedPrice
            : '',
          chargeAmount:
            purchasedShare.type.value === 'Charge Payment'
              ? this.shareAccountData.currency.displaySymbol + purchasedShare.amount
              : this.shareAccountData.currency.displaySymbol + purchasedShare.chargeAmount,
          amountRecievedOrReturned: this.shareAccountData.currency.displaySymbol + purchasedShare.amount
        };
        this.purchasedSharesTableDataSource.push(shareData);
      }
    }

    /*Initialising charges table data source.*/
    if (this.shareAccountData.charges.length > 0) {
      const shareAccountCharge = this.shareAccountData.charges.filter((charge: any) => charge.isActive === true);

      for (const charge of shareAccountCharge) {
        const chargeData: any = {
          name: charge.name,
          feeOrPenalty: charge.penalty ? 'penalty' : 'fee',
          paymentDueAt: charge.chargeTimeType.value,
          calculationType: charge.chargeCalculationType.value,
          due: charge.amount,
          paid: charge.amountPaid,
          waived: charge.amountWaived,
          outstanding: charge.amountOutstanding,
        };
        this.chargeTableDataSource.push(chargeData);
      }
    }

    /*Initialising dividends table data source.*/
    if (this.shareAccountData.dividends.length > 0) {

      for (const dividend of this.shareAccountData.dividends) {
        const dividendData: any = {
          transactionDate: dividend.postedDate,
          amount: this.shareAccountData.currency.displaySymbol + dividend.amount,
          transactionRef: dividend.savingsTransactionId,
          status: dividend.status.value
        };
        this.dividendsTableDataSource.push(dividendData);
      }
    }

    /*Initialising buttons.*/
    if (this.shareAccountData.status.value === 'Submitted and pending approval') {
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

    if (this.shareAccountData.status.value === 'Approved') {
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

    if (this.shareAccountData.status.value === 'Active') {
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

      if ( this.shareAccountData.charges.length > 0) {
        for (let i = 0; i < this.shareAccountData.charges.length; i++) {
          if (this.shareAccountData.charges[i].name === 'Annual fee - INR') {
            this.buttons.options.push({
              name: 'applyAnnualFees'
            });
            this.annualChargeId = this.shareAccountData.charges[i].id;
          }
        }
      }
    }
  }

  ngOnInit() {
  }

}
