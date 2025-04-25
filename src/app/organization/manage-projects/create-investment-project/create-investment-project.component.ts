import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientsService } from 'app/clients/clients.service';
import { OrganizationService } from 'app/organization/organization.service';

@Component({
  selector: 'mifosx-create-investment-project',
  templateUrl: './create-investment-project.component.html',
  styleUrls: ['./create-investment-project.component.scss']
})
export class CreateInvestmentProjectComponent implements OnInit, AfterViewInit {
  /** New Investment Project form */
  investmentProjectForm: UntypedFormGroup;
  clientsData: any[] = [];
  loansData: any[] = [];
  countryData: any[] = [];
  categoryData: any[] = [];
  subcategoryData: any[] = [];
  areaData: any[] = [];
  currency: any;
  statusData: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private clientsService: ClientsService,
    private organizationService: OrganizationService
  ) {
    this.route.data.subscribe(
      (data: { accountData: any; countryData: any; categoryData: any; subcategoryData: any; areaData: any; statusData: any}) => {
        this.currency = data.accountData.currency;
        this.clientsData = [];
        this.countryData = data.countryData.codeValues;
        this.categoryData = data.categoryData.codeValues;
        this.subcategoryData = data.subcategoryData.codeValues;
        this.areaData = data.areaData.codeValues;
        this.statusData = data.statusData.codeValues;
      }
    );
  }

  ngOnInit(): void {
    this.setupInvestmentProjectForm();
    this.loansData = [];
  }

  ngAfterViewInit() {
    this.investmentProjectForm.controls.ownerId.valueChanges.subscribe((value: string) => {
      if (value.length >= 2) {
        this.clientsService.getFilteredClients('displayName', 'ASC', true, value).subscribe((data: any) => {
          this.clientsData = data.pageItems;
        });
      }
    });
  }

  setupInvestmentProjectForm() {
    this.investmentProjectForm = this.formBuilder.group({
      countryId: [
        '',
        Validators.required
      ],
      ownerId: [
        0,
        Validators.required
      ],
      loanId: [
        0,
        Validators.required
      ],
      name: [
        '',
        Validators.required
      ],
      subtitle: [
        '',
        Validators.required
      ],
      impactDescription: [
        '',
        Validators.required
      ],
      institutionDescription: [
        '',
        Validators.required
      ],
      teamDescription: [
        '',
        Validators.required
      ],
      financingDescription: [
        '',
        Validators.required
      ],
      amount: [
        0,
        Validators.required
      ],
      projectRate: [
        '',
        Validators.required
      ],
      period: [
        '',
        Validators.required
      ],
      categoryId: [
        '',
        Validators.required
      ],
      subCategories: [
        '',
        Validators.required
      ],
      areaId: [
        '',
        Validators.required
      ],
      isActive: [false],
      statusId: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Displays Client name in form control input.
   * @param {any} client Client data.
   * @returns {string} Client name if valid otherwise undefined.
   */
  displayClient(client: any): string | undefined {
    return client ? client.displayName : undefined;
  }

  clientSelected(event: any) {
    const client: any = event.option.value;
    this.loansData = [];
    this.clientsService.getClientAccountData(client.id).subscribe((response: any) => {
      if (response.loanAccounts) {
        response.loanAccounts.forEach((loan: any) => {
          if (loan.status.id == 100) {
            this.loansData.push({ id: loan.id, accountNo: loan.accountNo, productName: loan.productName });
          }
        });
      }
    });
  }

  submit() {
    const currencyCode: string = this.currency.code;

    const payload = {
      ...this.investmentProjectForm.getRawValue(),
      currencyCode
    };
    const owner: any = payload['ownerId'];
    payload['ownerId'] = owner['id'];
    payload['amount'] = payload['amount'] * 1;
    payload['subCategories'] = '[' + payload['subCategories'].join(',') + ']';
    console.log(payload);
    this.organizationService.createInvestmentProjects(payload).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
