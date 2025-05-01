import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-loans-active-client-members',
  templateUrl: './loans-active-client-members.component.html',
  styleUrls: ['./loans-active-client-members.component.scss']
})
export class LoansActiveClientMembersComponent implements OnInit {
  loanId: any = null;
  @Input() activeClientMembers?: any;
  @Input() loansAccountFormValid: boolean;

  constructor(private route: ActivatedRoute) {
    this.loanId = this.route.snapshot.params['loanId'];
  }
  dataSource: any;
  /** Check for select all the Clients List */
  selectAllItems = false;
  /** Loan Purpose Options */
  loanPurposeOptions: string[] = [];
  /** Table Displayed Columns */
  displayedColumn: string[] = [
    'check',
    'id',
    'name',
    'purpose',
    'amount'
  ];

  ngOnInit(): void {
    // console.log("Active Client Members in LoansActiveClientMembersComponent:", this.activeClientMembers);

    this.dataSource = new MatTableDataSource<any>(this.activeClientMembers);
  }

  get isValid() {
    // console.log("LoansActiveClientMembersComponent isValid:", this.selectedClientMembers?.selectedMembers?.reduce((acc: any, cur: any) => acc + (cur.principal ?? 0), 0) > 0);
    return (
      !this.activeClientMembers ||
      this.selectedClientMembers?.selectedMembers?.reduce((acc: any, cur: any) => acc + (cur.principal ?? 0), 0) > 0
    );
  }
  get selectedClientMembers() {
    return { selectedMembers: this.activeClientMembers.filter((item: any) => item.selected) };
  }

  /** Toggle all checks */
  toggleSelects() {
    for (const member of this.activeClientMembers) {
      member.selected = this.selectAllItems;
    }
  }

  /** Check if all the checks are selected */
  toggleSelect() {
    const len = this.activeClientMembers.length;
    this.selectAllItems =
      len === 0 ? false : this.activeClientMembers.filter((item: any) => item.selected).length === len;
  }
}
