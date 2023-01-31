import { Component, OnInit, Input } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { FormControl } from "@angular/forms";

import { DeleteDialogComponent } from "app/shared/delete-dialog/delete-dialog.component";
import { Router } from "@angular/router";
import { ProductsService } from "app/products/products.service";

@Component({
  selector: "mifosx-loan-product-charges-step",
  templateUrl: "./loan-product-charges-step.component.html",
  styleUrls: ["./loan-product-charges-step.component.scss"],
})
export class LoanProductChargesStepComponent implements OnInit {
  @Input() loanProductsTemplate: any;
  @Input() currencyCode: FormControl;
  @Input() multiDisburseLoan: FormControl;

  chargeData: any;
  overdueChargeData: any;
  countryId: any;

  chargesDataSource: {}[];
  displayedColumns: string[] = ["name", "chargeCalculationType", "amount", "chargeTimeType", "action"];

  pristine = true;

  constructor(public dialog: MatDialog, private router: Router, private productService: ProductsService) {}

  ngOnInit() {
    this.productService.countryId.subscribe((val) => {
      this.countryId = val || this.loanProductsTemplate.countryId;
      this.getCharges(this.countryId);
    });
    this.chargesDataSource = this.chargeData || [];
    if (this.router.url.includes("edit")) {
      this.chargeData = this.loanProductsTemplate.chargeOptions;
      this.overdueChargeData = this.loanProductsTemplate.penaltyOptions
        ? this.loanProductsTemplate.penaltyOptions.filter(
            (penalty: any) => penalty.chargeTimeType.code === "chargeTimeType.overdueInstallment"
          )
        : [];
      this.chargesDataSource = this.loanProductsTemplate.charges || [];
    }
    this.pristine = true;

    this.currencyCode.valueChanges.subscribe(() => (this.chargesDataSource = []));
    this.multiDisburseLoan.valueChanges.subscribe(() => (this.chargesDataSource = []));
  }

  getCharges(countryId: any) {
    this.productService.getCharges().subscribe((data) => {
      this.chargeData = data.filter((x) => x.penalty === false && x.countryId === countryId);
      this.overdueChargeData = data.filter((x) => x.penalty === true && x.countryId === countryId);
    });
  }

  addCharge(charge: any) {
    this.chargesDataSource = this.chargesDataSource.concat([charge.value]);
    charge.value = "";
    this.pristine = false;
  }

  deleteCharge(charge: any) {
    const deleteChargeDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `charge ${charge.name}` },
    });
    deleteChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1);
        this.chargesDataSource = this.chargesDataSource.concat([]);
        this.pristine = false;
      }
    });
  }

  get loanProductCharges() {
    return {
      charges: this.chargesDataSource,
    };
  }
}
