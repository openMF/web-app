import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OrganizationService } from 'app/organization/organization.service';
import { ProductsService } from 'app/products/products.service';
import { OUHierarchy } from 'app/hierarchy-generator';

@Component({
  selector: 'mifosx-loan-product-preview-step',
  templateUrl: './loan-product-preview-step.component.html',
  styleUrls: ['./loan-product-preview-step.component.scss']
})
export class LoanProductPreviewStepComponent implements OnInit {

  @Input() loanProductsTemplate: any;
  @Input() accountingRuleData: any;
  @Input() loanProduct: any;
  @Output() submit = new EventEmitter();

  unitNames: any = [];
  loanProductOffices: any;
  arrayList: any = [];
  countries: any = [];

  channelList: any = [];

  variationsDisplayedColumns: string[] = ['valueConditionType', 'borrowerCycleNumber', 'minValue', 'defaultValue', 'maxValue'];
  chargesDisplayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType'];
  paymentFundSourceDisplayedColumns: string[] = ['paymentTypeId', 'fundSourceAccountId'];
  feesPenaltyIncomeDisplayedColumns: string[] = ['chargeId', 'incomeAccountId'];

  constructor(
    private organizationService: OrganizationService,
    private productsService: ProductsService,
    public ouHierarchy: OUHierarchy
  ) {
    this.getCountries();
    this.getChannels();

   }

  ngOnInit() {
    console.log('loanData', this.loanProduct);
    if (this.loanProduct.officeIds && this.loanProduct.officeIds.length > 0) {
      this.organizationService.searchCountryById(this.loanProduct.countryId).subscribe((res: any) => {
        const data = res.map((item: any) => ({
          name: item.name,
          id: item.id,
          parentId: item.parentId,
        }));

        const treeview = data.filter(x => this.loanProduct.officeIds.includes(x.id));

        const response = this.ouHierarchy.flatToHierarchy(treeview, data.filter(x => x.id !== this.loanProduct.countryId));
        if (response && response.length > 0) {
          this.arrayList = response.filter((x) => x.children?.length > 0);
          this.arrayList.forEach((resp) => {
            const officeCount = data.filter((x) => x.parentId === resp.id);
            if (resp.children.length === officeCount?.length) {
              resp.children = 'All OU\'s';
            } else {
              resp.children = resp.children
                .map((x) => {
                  return x.name;
                })
                .join(', ');
            }
          });
        }
      });
    }
  }

  getChannels() {
    this.productsService.getChannels().subscribe((data) => {
      this.loanProduct.channels.map((response) => {
        const channelCount = data.filter((x) => x.code === response);
        this.channelList.push(channelCount);
      });
    });
  }

  getCountries() {
    this.productsService.getCountries().subscribe((response: any) => {
      this.countries = response.filter((x) => x.id === this.loanProduct.countryId);
    });
  }
}
