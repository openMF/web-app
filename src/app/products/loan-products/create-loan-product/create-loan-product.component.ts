/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { LoanWizardProfileMode } from '../wizard/loan-product.config';
import { ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';
import { LoanProducts } from '../loan-products';
import { Accounting } from 'app/core/utils/accounting';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductBaseComponent } from '../common/loan-product-base.component';
import { LoanProductWizardComponent } from '../wizard/loan-product-wizard.component';

@Component({
  selector: 'mifosx-create-loan-product',
  templateUrl: './create-loan-product.component.html',
  styleUrls: ['./create-loan-product.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    LoanProductWizardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateLoanProductComponent extends LoanProductBaseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  private loanProducts = inject(LoanProducts);
  private accounting = inject(Accounting);

  loanProductsTemplate: any;
  accountingRuleData: string[] = [];
  itemsByDefault: any[] = [];
  profileMode: LoanWizardProfileMode = 'personal';
  pageTitle = 'Create Personal Loan';

  constructor() {
    super();
    const loanProducts = this.loanProducts;

    const productType = this.route.snapshot.queryParamMap.get('productType') || 'loan';
    this.loanProductService.initialize(productType);

    const routePath = this.route.snapshot.routeConfig?.path;
    this.profileMode = routePath === 'custom-advanced' ? 'custom-advanced' : 'personal';
    this.pageTitle =
      this.profileMode === 'custom-advanced' ? 'Custom / Advanced Loan Configuration' : 'Create Personal Loan';

    this.route.data.subscribe((data) => {
      this.loanProductsTemplate = data['loanProductsTemplate'];

      if (this.loanProductService.isLoanProduct) {
        const assetAccountData = this.loanProductsTemplate.accountingMappingOptions.assetAccountOptions || [];
        const liabilityAccountData = this.loanProductsTemplate.accountingMappingOptions.liabilityAccountOptions || [];
        this.loanProductsTemplate.accountingMappingOptions.assetAndLiabilityAccountOptions =
          assetAccountData.concat(liabilityAccountData);
      }

      this.itemsByDefault = loanProducts.setItemsByDefault(data['configurations']);
      this.loanProductsTemplate['itemsByDefault'] = this.itemsByDefault;
      this.loanProductsTemplate = loanProducts.updateLoanProductDefaults(this.loanProductsTemplate, false);
    });
  }

  ngOnInit() {
    this.accountingRuleData = this.accounting.getAccountingRulesForLoans(this.loanProductService.isLoanProduct);
  }

  submit() {
    this.router.navigate(
      [
        '../'
      ],
      {
        relativeTo: this.route
      }
    );
  }
}
