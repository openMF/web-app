import { ClientsService } from 'app/clients/clients.service';
import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'mifosx-view-client',
  templateUrl: './view-client.component.html',
  styleUrls: ['./view-client.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ViewClientComponent implements OnInit, OnDestroy {
  notes: any = undefined;
  id: number = undefined;
  loanAccounts: any = undefined;
  savingsAccounts: any = undefined;
  shareAccounts: any = undefined;
  upcomingCharges: any = undefined;
  clientInfo: any = undefined;
  paramsSubscription: Subscription;
  post: any = [];
  clientAddress: any = undefined;
  allNotes: any = undefined;
  clientIdentifiers: any = undefined;
  clientDocuments: any = undefined;
  docId: any = undefined;
  private LOAN_DATA: any = undefined;
  private SAVINGS_DATA: any = undefined;
  private SHARES_DATA: any = undefined;
  displayedLoanColumns = ['account', 'loanAccount', 'originalLoan', 'loanBalance', 'amountPaid', 'type'];
  displayedSavingsColumns = ['account', 'savingsAccount', 'lastActive', 'balance'];
  displayedSharesColumns = ['account', 'shareAccount', 'approvedShares', 'pending'];
  displayedIdentifierColumns = ['id', 'description', 'type', 'status', 'actions'];
  displayedDocumentColumns = ['name', 'description', 'filename', 'actions'];

  dataSourceLoan = new MatTableDataSource([]);
  dataSourceSavings = new MatTableDataSource([]);
  dataSourceShares = new MatTableDataSource([]);
  dataSourceIdentifiers = new MatTableDataSource([]);
  dataSourceDocuments = new MatTableDataSource([]);

  @ViewChild('f') noteForm: NgForm;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('loanPaginator') loanPaginator: MatPaginator;
  @ViewChild('savingsPaginator') savingsPaginator: MatPaginator;
  @ViewChild('sharesPaginator') sharesPaginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private route: ActivatedRoute, private clientService: ClientsService,
              private router: Router, public dialog: MatDialog) {}

  ngOnInit() {
    this.paramsSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
        }
      );

    this.getClientId(this.id);
    this.getClientAccounts(this.id);
    this.getClientCharges(this.id);
    this.getClientAddress(this.id);
    this.getClientNotes(this.id);
    this.getClientIdentifier(this.id);
    this.getClientDocuments(this.id);
  }

  getClientId(id: any) {
    this.clientService.getClientId(id)
      .subscribe(
        (res => {
          const groupArray = new Array;
          this.clientInfo = res;
          this.clientInfo.dateOfBirth = this.clientInfo.dateOfBirth.reverse().join('-');
          this.clientInfo.activationDate = this.clientInfo.activationDate.reverse().join('-');

          this.clientInfo.groups.forEach(function (item: any) {
            groupArray.push(item.name);
          });
          this.clientInfo.groupNames = groupArray.join('|');

        })
      );
  }

  getClientAccounts(id: any) {
    this.clientService.getClientAccounts(id)
      .subscribe(
        (res => {
          this.loanAccounts = res['loanAccounts'];
          this.savingsAccounts = res['savingsAccounts'];
          this.shareAccounts = res['shareAccounts'];
          this.LOAN_DATA = this.loanAccounts;
          this.SAVINGS_DATA = this.savingsAccounts;
          this.SHARES_DATA = this.shareAccounts;
          this.dataSourceLoan = new MatTableDataSource(this.LOAN_DATA);
          this.dataSourceSavings = new MatTableDataSource(this.SAVINGS_DATA);
          this.dataSourceShares = new MatTableDataSource(this.SHARES_DATA);
          this.dataSourceLoan.paginator = this.loanPaginator;
          this.dataSourceSavings.paginator = this.savingsPaginator;
          this.dataSourceShares.paginator = this.sharesPaginator;
          this.dataSourceLoan.sort = this.sort;
          this.dataSourceSavings.sort = this.sort;
          this.dataSourceShares.sort = this.sort;

        })
      );
  }

  getClientCharges(id: any) {
    this.clientService.getClientCharges(id)
      .subscribe(
        (res => {
          this.upcomingCharges = res['pageItems'];
        })
      );
  }

  getClientAddress(id: any) {
    this.clientService.getClientAddress(id)
      .subscribe(
        (res => {
          this.clientAddress = res;
        })
      );
  }

  getClientNotes(id: any) {
    this.clientService.getClientNote(id)
      .subscribe(
        (res => {
          this.allNotes = res;
        })
      );
  }

  getClientIdentifier(id: any) {
    this.clientService.getClientIdentifiers(id)
      .subscribe(
        (res => {
          this.clientIdentifiers = res;
          this.clientIdentifiers.forEach(function (item: any) {
            item.status = item.status.split('.')[1];
          });

          this.dataSourceIdentifiers = new MatTableDataSource(this.clientIdentifiers);
          this.dataSourceIdentifiers.paginator = this.paginator;
          this.dataSourceIdentifiers.sort = this.sort;
        })
      );
  }

  getClientDocuments(id: any) {
    this.clientService.getClientDocuments(id)
      .subscribe(
        (res => {
          this.clientDocuments = res;
          this.docId = res.id;
          this.dataSourceDocuments = new MatTableDataSource(res);
          this.dataSourceDocuments.paginator = this.paginator;
          this.dataSourceDocuments.sort = this.sort;
        })
      );

  }
  onSubmit() {
    //  this.submitted = true;
    this.notes = {};
    //  const d = new Date();
    this.notes.note = this.noteForm.value.clientnotes;
    // this.notes.createdOn =  d;
    console.log(this.notes);
    this.clientService.postClientNote(this.id, this.notes)
      .subscribe(
        (res => {
          this.getClientNotes(this.id);
          return true;
        })
      );
    this.noteForm.reset();

  }

  deleteClientIdentifier(id: number, identifierId: number) {
    this.clientService.deleteClientIdentifier(id, identifierId)
      .subscribe(
        (res => {
          this.getClientIdentifier(this.id);
          return true;
        })
      );
  }
  deleteClientDocuments(id: number, docId: number) {
    console.log(docId);
    this.clientService.deleteClientDocuments(id, docId)
      .subscribe(
        (res => {
          this.getClientDocuments(this.id);
          return true;
        })
      );
  }

/*   openDialog() {
    const dialogRef = this.dialog.open(ViewClientDialogComponent, {
      height: '350px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
 */
  ngOnDestroy() {
    this.paramsSubscription.unsubscribe();
  }

}


/*
@Component({
  selector: 'mifosx-view-client-component-dialog',
  templateUrl: 'view-client-component-dialog.html',
})
export class ViewClientDialogComponent implements OnInit, OnDestroy {

  paramsSubscription: Subscription;
  id: any = undefined;
  clientDocuments: any = undefined;
  constructor(private route: ActivatedRoute, private clientService: ClientsService,
    private router: Router, public dialog: MatDialog) {}

  ngOnInit() {
    this.paramsSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
        }
      );
      this.getClientDocuments(this.id);
    }

    getClientDocuments(id: any) {
      this.clientService.getClientDocuments(id)
        .subscribe(
          (res => {
            this.clientDocuments = res;
          })
        );
    }

    ngOnDestroy() {
      this.paramsSubscription.unsubscribe();
    }

}
 */
