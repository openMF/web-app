import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import DataFlattner from "app/core/utils/data-flattner";
import { OrganizationService } from "app/organization/organization.service";
import { ProductsService } from "app/products/products.service";
import { CountryTreeViewComponent } from "app/shared/country-tree-view/country-tree-view.component";
import { DragulaService } from "ng2-dragula";

@Component({
  selector: "mifosx-loan-product-allocation",
  templateUrl: "./loan-product-allocation.component.html",
  styleUrls: ["./loan-product-allocation.component.scss"],
})
export class LoanProductAllocationComponent implements OnInit {
  countries: any = [];
  countriesDataSliced: any = [];
  countryId: any;
  data: any;
  treeDataSource: any;
  selectedUnits: any = [];
  allocationForm: FormGroup;
  loanTypeOptions: any;
  loanTypeOptionsModel: any;
  @ViewChild(CountryTreeViewComponent) countryTreeComponent: CountryTreeViewComponent;
  loanAllocationTemplate: any;
  officeName: any;
  constructor(
    private productService: ProductsService,
    private organizationService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dragulaService: DragulaService
  ) {
    if (this.router.url.includes("edit")) {
      this.route.data.subscribe((data: { loanProductAllocationData: any }) => {
        this.loanAllocationTemplate = data.loanProductAllocationData;
        this.officeName = this.loanAllocationTemplate.districtOffice.name;
        this.loanTypeOptions = this.loanAllocationTemplate.loanPaymentAllocationSetting.loanTypeOptions;
        this.setLoanTypeOptions();
      });
    } else {
      this.getCountries();
    }
  }

  setLoanTypeOptions(){
    const liablity = this.loanAllocationTemplate?.loanPaymentAllocationSetting?.liabilityPriority.split(" ");
    if (liablity) {
      const loanOptions = [];
      liablity.forEach((element) => {
        if (element && element != "" && element.length > 0) {
          const loanOptionItem = this.loanTypeOptions?.filter((x) => x.code === element);
          if (loanOptionItem && loanOptionItem.length > 0) {
            loanOptions.push(loanOptionItem[0]);
          }
        }
      });
      this.loanTypeOptions = loanOptions;
    }
    this.loanTypeOptionsModel = this.loanTypeOptions.map((x) => {
      return x.name;
    });
  }

  ngOnInit(): void {
    this.allocationForm = this.formBuilder.group({
      id: [this.loanAllocationTemplate?.loanPaymentAllocationSetting?.id],
      countryId: [null, Validators.required],
      repaymentChoice: [
        this.loanAllocationTemplate?.loanPaymentAllocationSetting?.repaymentChoice,
        Validators.required,
      ],
      systemChoice: [this.loanAllocationTemplate?.loanPaymentAllocationSetting?.systemChoice],
      liabilityPriority: [this.loanAllocationTemplate?.loanPaymentAllocationSetting?.liabilityPriority],
      districtIds: [this.selectedUnits],
    });
  }

  getCountries() {
    this.productService.getAllocationTemplate().subscribe((response: any) => {
      this.countries = response.countryOptions;
      this.loanTypeOptions = response.loanTypeOptions;
      this.loanTypeOptionsModel = this.loanTypeOptions.map((x) => {
        return x.name;
      });
      this.countriesDataSliced = this.countries;
    });
  }

  public isFiltered(country: any) {
    return this.countriesDataSliced.find((item) => item.id === country.id);
  }

  search(event: any) {
    if (!event.id) {
      this.countryId = this.allocationForm.get["countryId"];
    } else {
      this.countryId = event.id;
      this.productService.countryId = event.value;
    }
    this.selectedUnits = [];
    this.organizationService.searchCountryById(this.countryId).subscribe((res: any) => {
      if (this.router.url.includes("edit")) {
        this.data = res
          .filter((x) => x.status === true)
          .map((item: any) => ({
            name: item.name,
            id: item.id,
            parentId: item.parentId,
            // checked: this.loanProductTemplate.offices.filter((c) => c.officeId === item.id)?.length > 0 ? true : false,
          }));
      } else {
        this.data = res
          .filter((x) => x.status === true)
          .map((item: any) => ({
            name: item.name,
            id: item.id,
            parentId: item.parentId,
            checked: false,
          }));
      }
      this.treeDataSource = DataFlattner.flatToHierarchy(this.data);
      this.countryTreeComponent?.refreshDataSource(this.treeDataSource);
    });
  }

  getCheckedUnits(event: any) {
    this.selectedUnits = event;
  }

  getLoanAllocationProduct() {
    const loanAllocationProduct = this.allocationForm.value;
    loanAllocationProduct.districtIds = this.selectedUnits.map((x: any) => {
      return x.id;
    });
    delete loanAllocationProduct.countryId;
    if (loanAllocationProduct.repaymentChoice === "CLIENT_CHOICE") {
      delete loanAllocationProduct.liabilityPriority;
      delete loanAllocationProduct.systemChoice;
    }
    if (loanAllocationProduct.systemChoice === "DUE_DATE") {
      delete loanAllocationProduct.liabilityPriority;
    } else {
      const loanOptions = [];
      this.loanTypeOptionsModel.forEach((element: any) => {
        loanOptions.push(
          this.loanTypeOptions
            .filter((x) => x.name === element)
            .map((c) => {
              return c.code;
            })
        );
      });
      loanAllocationProduct.liabilityPriority = loanOptions.join(" ");
    }
    return loanAllocationProduct;
  }
  submit() {
    let loanAllocationProduct = this.getLoanAllocationProduct();
    if (this.router.url.includes("edit")) {
      delete loanAllocationProduct.districtIds;
      const id = this.allocationForm.value.id;
      delete loanAllocationProduct.id;
      this.productService.updateLoanAllocationProduct(id, loanAllocationProduct).subscribe((response: any) => {
        this.selectedUnits = [];
        this.router.navigate(["../"], { relativeTo: this.route });
      });
    } else {
      delete loanAllocationProduct.id;
      this.productService.createLoanAllocationProduct(loanAllocationProduct).subscribe((response: any) => {
        this.selectedUnits = [];
        this.router.navigate(["../"], { relativeTo: this.route });
      });
    }
  }
}
