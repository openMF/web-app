import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
import { OUHierarchy } from 'app/hierarchy-generator';

@Component({
  selector: 'mifosx-view-loan-product',
  templateUrl: './view-loan-product.component.html',
  styleUrls: ['./view-loan-product.component.scss'],
})
export class ViewLoanProductComponent implements OnInit {
  loanProduct: any;
  loanProductOffices: any;
  arrayList: any = [];
  variationsDisplayedColumns: string[] = [
    'valueConditionType',
    'borrowerCycleNumber',
    'minValue',
    'defaultValue',
    'maxValue',
  ];
  chargesDisplayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType'];
  paymentFundSourceDisplayedColumns: string[] = ['paymentTypeId', 'fundSourceAccountId'];
  feesPenaltyIncomeDisplayedColumns: string[] = ['chargeId', 'incomeAccountId'];

  constructor(private route: ActivatedRoute, private organizationService: OrganizationService, public ouHierarchy: OUHierarchy ) {
    this.route.data.subscribe((data: { loanProduct: any }) => {
      this.loanProduct = data.loanProduct;
    });
  }

  ngOnInit() {
    this.loanProduct.allowAttributeConfiguration = Object.values(this.loanProduct.allowAttributeOverrides).some(
      (attribute: boolean) => attribute
    );

    if ( this.loanProduct?.offices?.length > 0) {
      this.organizationService.searchCountryById(this.loanProduct.countryId).subscribe((res: any) => {
        const data = res.map((item: any) => ({
          name: item.name,
          id: item.id,
          parentId: item.parentId,
        }));

        const treeview = this.loanProduct.offices;
        data.forEach((element) => {
          const checked = treeview.filter((x) => x.officeId === element.id);
          if (checked?.length > 0) {
            checked[0].parentId = element.parentId;
          }
        });

        const newTreeView = treeview.map((item: any) => ({
          name: item.officeName,
          id: item.officeId,
          parentId: item.parentId,
        }));

        const response = this.ouHierarchy.flatToHierarchy(newTreeView, data.filter(x => x.id !== this.loanProduct.countryId));
        if (response?.length > 0) {
          this.arrayList = response.filter((x) => x.children?.length > 0);
          this.arrayList.forEach((resp) => {
            const officeCount = data.filter((x) => x.parentId === resp.id);
            if (resp?.children?.length === officeCount?.length) {
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
}
