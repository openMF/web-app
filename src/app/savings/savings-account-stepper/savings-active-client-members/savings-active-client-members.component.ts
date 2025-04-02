import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'mifosx-savings-active-client-members',
  templateUrl: './savings-active-client-members.component.html',
  styleUrls: ['./savings-active-client-members.component.scss']
})
export class SavingsActiveClientMembersComponent implements OnInit {
  @Input() activeClientMembers?: any;
  selectAllItems = false;
  displayedColumn: string[] = [
    'check',
    'id',
    'name'
  ];

  constructor() {}

  dataSource: any;
  ngOnInit(): void {
    console.log('Active Client Members in LoansActiveClientMembersComponent:', this.activeClientMembers);
    this.dataSource = new MatTableDataSource<any>(this.activeClientMembers);
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
