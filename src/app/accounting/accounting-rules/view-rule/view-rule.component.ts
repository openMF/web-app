import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { AccountingService } from '../../accounting.service';
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

@Component({
  selector: 'mifosx-view-rule',
  templateUrl: './view-rule.component.html',
  styleUrls: ['./view-rule.component.scss']
})
export class ViewRuleComponent implements OnInit {

  accountingRule: any;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private accountingService: AccountingService,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { accountingRule: any }) => {
      this.accountingRule = data.accountingRule;
    });
  }

  ngOnInit() {
  }

  deleteAccountingRule() {
    const deleteAccountingRuleDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `accounting rule ${this.accountingRule.id}` }
    });
    deleteAccountingRuleDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.accountingService.deleteAccountingRule(this.accountingRule.id)
          .subscribe(() => {
            this.router.navigate(['/accounting/accounting-rules']);
          });
      }
    });
  }

}
