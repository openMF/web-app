import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoanProduct } from '../../models/loan-product.model';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { TranslateService } from '@ngx-translate/core';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { LoanProductSummaryComponent } from '../../common/loan-product-summary/loan-product-summary.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    LoanProductSummaryComponent
  ]
})
export class GeneralTabComponent implements OnInit {
  loanProduct: LoanProduct;
  useDueForRepaymentsConfigurations = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private productsService: ProductsService,
    private settingsService: SettingsService,
    private translateService: TranslateService
  ) {
    this.route.data.subscribe((data: { loanProduct: any }) => {
      this.loanProduct = data.loanProduct;
      this.useDueForRepaymentsConfigurations =
        !this.loanProduct.dueDaysForRepaymentEvent && !this.loanProduct.overDueDaysForRepaymentEvent;
    });
  }

  ngOnInit() {
    this.loanProduct.allowAttributeConfiguration = Object.values(this.loanProduct.allowAttributeOverrides).some(
      (attribute: boolean) => attribute
    );
  }

  exportDefinition(): void {
    const product = this.loanProduct;
    delete product['id'];
    const fileName: string = product.name.replace(' ', '_') + '.json';
    const link = document.createElement('a');
    link.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(JSON.stringify(product, null, 2)));
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  copyProduct(): void {
    const productNameTmp = `${this.loanProduct.name.replace(' ', '_')}_${this.translateService.instant('labels.text.Copy')}`;
    const productCopy = JSON.parse(JSON.stringify(this.loanProduct));

    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'name',
        label: this.translateService.instant('labels.inputs.Name'),
        value: productNameTmp,
        type: 'text',
        required: true,
        order: 2
      }),
      new InputBase({
        controlName: 'shortName',
        label: this.translateService.instant('labels.inputs.Short Name'),
        value: '',
        type: 'text',
        required: true,
        order: 2
      })

    ];
    const data = {
      title: `${this.translateService.instant('labels.buttons.Create')} ${this.translateService.instant('labels.inputs.Loan Product')}`,
      layout: { addButtonText: this.translateService.instant('labels.buttons.Create') },
      formfields: formfields
    };
    const createProductDialogRef = this.dialog.open(FormDialogComponent, { data });
    createProductDialogRef.afterClosed().subscribe((productResponse: any) => {
      if (productResponse.data) {
        productCopy['name'] = productResponse.data.value['name'];
        productCopy['shortName'] = productResponse.data.value['shortName'];
        productCopy['delinquencyBucketId'] = productCopy['delinquencyBucket']
          ? productCopy['delinquencyBucket']['id']
          : null;
        productCopy['currencyCode'] = productCopy['currency'] ? productCopy['currency']['code'] : null;
        productCopy['interestRatePerPeriod'] = productCopy['annualInterestRate'];
        productCopy['transactionProcessingStrategyCode'] = productCopy['transactionProcessingStrategyName'];
        productCopy['allowPartialPeriodInterestCalculation'] = productCopy['allowPartialPeriodInterestCalculation'];
        productCopy['locale'] = this.settingsService.language.code;

        let valueTmp: any = productCopy['daysInMonthType']['value'];
        productCopy['daysInMonthType'] = valueTmp;
        valueTmp = productCopy['daysInYearType']['value'];
        productCopy['daysInYearType'] = valueTmp;
        valueTmp = productCopy['amortizationType']['id'];
        productCopy['amortizationType'] = valueTmp;

        delete productCopy['id'];
        delete productCopy['advancedPaymentAllocationTransactionTypes'];
        delete productCopy['advancedPaymentAllocationTypes'];
        delete productCopy['creditAllocationTransactionTypes'];
        delete productCopy['creditAllocationAllocationTypes'];
        delete productCopy['delinquencyBucketOptions'];
        delete productCopy['allowAttributeConfiguration'];
        delete productCopy['status'];
        delete productCopy['delinquencyBucket'];
        delete productCopy['currency'];
        delete productCopy['isRatesEnabled'];
        delete productCopy['annualInterestRate'];
        delete productCopy['transactionProcessingStrategyName'];
        delete productCopy['allowPartialPeriodInterestCalculation'];
        delete productCopy['advancedPaymentAllocationFutureInstallmentAllocationRules'];

        this.productsService.createLoanProduct(productCopy).subscribe((response: any) => {
          this.router.navigate(
            [
              '../',
              response.resourceId
            ],
            { relativeTo: this.route }
          );
        });
      }
    });
  }
}
