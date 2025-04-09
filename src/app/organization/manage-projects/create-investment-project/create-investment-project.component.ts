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
  currency: any;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private clientsService: ClientsService,
    private organizationService: OrganizationService
  ) {
    this.route.data.subscribe((data: { accountData: any }) => {
      this.currency = data.accountData.currency;
      this.clientsData = [];
    });
  }

  ngOnInit(): void {
    this.setupInvestmentProjectForm();
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
      ownerId: [
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
        0,
        Validators.required
      ],
      period: [
        0,
        Validators.required
      ],
      isActive: [false]
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

  submit() {
    const currencyCode: string = this.currency.code;
    const categories: number[] = [
      1,
      2
    ];
    const payload = {
      ...this.investmentProjectForm.getRawValue(),
      currencyCode,
      categories
    };
    const owner: any = payload['ownerId'];
    payload['ownerId'] = owner['id'];
    payload['amount'] = payload['amount'] * 1;
    payload['countryId'] = 18;
    console.log(payload);
    this.organizationService.createInvestmentProjects(payload).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
