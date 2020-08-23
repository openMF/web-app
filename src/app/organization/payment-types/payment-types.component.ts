/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../organization.service';

/** Custom Components */
import { DeleteDialogComponent } from '../../shared/delete-dialog/delete-dialog.component';

/**
 * Payment Types component.
 */
@Component({
  selector: 'mifosx-payment-types',
  templateUrl: './payment-types.component.html',
  styleUrls: ['./payment-types.component.scss']
})
export class PaymentTypesComponent implements OnInit {

  /** Payment Types data. */
  paymentTypesData: any;
  /** Columns to be displayed in payment types table. */
  displayedColumns: string[] = ['name', 'description', 'isCashPayment', 'position', 'actions'];
  /** Data source for payment types table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for payment types table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for payment types table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the payment types data from `resolve`.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(private organizationService: OrganizationService,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
    this.route.data.subscribe(( data: { paymentTypes: any }) => {
      this.paymentTypesData = data.paymentTypes;
    });
  }

  /**
   * Filters data in payment types table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the payment types table.
   */
  ngOnInit() {
    this.setPaymentTypes();
  }

  /**
   * Initializes the data source, paginator and sorter for payment types table.
   */
  setPaymentTypes() {
    this.dataSource = new MatTableDataSource(this.paymentTypesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Deletes the payment type
   * @param {string} paymentTypeId Payment Type ID of payment type to be deleted.
   */
  deletePaymentType(paymentTypeId: string) {
    const deletePaymentTypeDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `payment type ${paymentTypeId}` }
    });
    deletePaymentTypeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationService.deletePaymentType(paymentTypeId)
          .subscribe(() => {
            this.paymentTypesData = this.paymentTypesData.filter((paymentType: any) => paymentType.id !== paymentTypeId);
            this.setPaymentTypes();
          });
      }
    });
  }

}
