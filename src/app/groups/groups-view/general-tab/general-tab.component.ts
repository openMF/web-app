/** Angular Imports */
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

/** Custom Services */
import { GroupsService } from "../../groups.service";

/**
 * Groups View General Tab Component.
 */
@Component({
  selector: "mifosx-general-tab",
  templateUrl: "./general-tab.component.html",
  styleUrls: ["./general-tab.component.scss"],
})
export class GeneralTabComponent implements OnInit {
  /** Group's all accounts data */
  groupAccountData: any;
  /** Group's loan accounts data */
  loanAccounts: any;
  /** Group's savings accounts data */
  savingAccounts: any;
  /** Group Summary */
  groupSummary: any;
  /** Group's Client Members */
  groupClientMembers: any;
  /** Group View Data */
  groupViewData: any;
  /** Qualification data for each loan product */
  qualificationDataMap: { [loanProductId: number]: any } = {};
  /** Total qualified members across all loan products */
  totalQualifiedMembers = 0;
  /** Columns to be Displayed for client members table */
  clientMemberColumns: string[] = ["Name", "Account No", "Office", "JLG Loan Application"];
  /** Columns to be displayed for open loan accounts table */
  openLoansColumns: string[] = [
    "Account No",
    "Loan Account",
    "Client",
    "Original Loan",
    "Loan Balance",
    "Amount Paid",
    "Type",
    "Actions",
  ];
  /** Columns to be displayed for closed loan accounts table */
  closedLoansColumns: string[] = [
    "Account No",
    "Loan Account",
    "Original Loan",
    "Loan Balance",
    "Amount Paid",
    "Type",
    "Closed Date",
  ];
  /** Columns to be displayed for open savings accounts table */
  openSavingsColumns: string[] = ["Account No", "Saving Account", "Last Active", "Balance", "Actions"];
  /** Columns to be displayed for closed accounts table */
  closedSavingsColumns: string[] = ["Account No", "Saving Account", "Closed Date"];
  /** Boolean for toggling loan accounts table */
  showClosedLoanAccounts = false;
  /** Boolean for toggling savings accounts table */
  showClosedSavingAccounts = false;

  /**
   * Fetches group's related data from `resolve`
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute, private groupsService: GroupsService) {
    this.route.data.subscribe((data: { groupAccountsData: any; groupClientMembers: any; groupSummary: any }) => {
      this.groupAccountData = data.groupAccountsData;
      this.savingAccounts = data.groupAccountsData.savingsAccounts;
      this.loanAccounts = data.groupAccountsData?.memberLoanAccounts;
      this.groupSummary = data.groupSummary ? data.groupSummary[0] : null;
    });
    this.route.parent.data.subscribe((data: { groupViewData: any }) => {
      this.groupViewData = data.groupViewData;
      this.groupClientMembers = data.groupViewData.clientMembers;
    });
  }

  ngOnInit() {
    this.fetchQualificationData();
  }

  /**
   * Fetches qualification data for the group
   * Uses /loanproducts/qualifiedclients?groupId=X to get all qualified clients in this group.
   */
  fetchQualificationData() {
    const groupId = this.groupViewData?.id;
    if (!groupId) {
      return;
    }

    this.groupsService.getGroupQualificationData(groupId).subscribe(
      (data: any[]) => {
        if (!data || data.length === 0) {
          return;
        }

        this.totalQualifiedMembers = data.length;

        // Group by loan product ID
        data.forEach((entry: any) => {
          const productId = entry.loanProductId;
          if (!productId) { return; }
          if (!this.qualificationDataMap[productId]) {
            this.qualificationDataMap[productId] = {
              loanProductId: productId,
              loanProductName: entry.loanProductName,
              qualifiedMembers: 0
            };
          }
          this.qualificationDataMap[productId].qualifiedMembers++;
        });
      },
      () => { }
    );
  }

  /**
   * Toggles loan accounts table.
   */
  toggleLoanAccountsOverview() {
    this.showClosedLoanAccounts = !this.showClosedLoanAccounts;
  }

  /**
   * Toggles savings account table.
   */
  toggleSavingAccountsOverview() {
    this.showClosedSavingAccounts = !this.showClosedSavingAccounts;
  }

  /**
   * Stops the propagation to view pages.
   * @param $event Mouse Event
   */
  routeEdit($event: MouseEvent) {
    $event.stopPropagation();
  }
}
