import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { AccountingService } from '../../accounting.service';
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

@Component({
  selector: 'mifosx-view-financial-activity-mapping',
  templateUrl: './view-financial-activity-mapping.component.html',
  styleUrls: ['./view-financial-activity-mapping.component.scss']
})
export class ViewFinancialActivityMappingComponent implements OnInit {

  financialActivityAccountId: any;
  financialActivityAccountData: any;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private accountingService: AccountingService,
              public dialog: MatDialog) { }

  ngOnInit() {
    this.financialActivityAccountId = this.route.snapshot.paramMap.get('id');
    this.getFinancialActivityAccount();
  }

  getFinancialActivityAccount() {
    this.accountingService.getFinancialActivityAccount(this.financialActivityAccountId, false)
      .subscribe((financialActivityAccountData: any) => {
        this.financialActivityAccountData = financialActivityAccountData;
      });
  }

  deleteFinancialActivityAccount() {
    const deleteFinancialActivityAccountDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `financial activity mapping ${this.financialActivityAccountId}` }
    });
    deleteFinancialActivityAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.accountingService.deleteFinancialActivityAccount(this.financialActivityAccountId)
          .subscribe(() => {
            this.router.navigate(['/accounting/financial-activity-mappings']);
          });
      }
    });
  }

}
