import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'mifosx-create-investment-project',
  templateUrl: './create-investment-project.component.html',
  styleUrls: ['./create-investment-project.component.scss']
})
export class CreateInvestmentProjectComponent implements OnInit {
  /** New Investment Project form */
  investmentProjectForm: any;
  clientsData: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private router: Router
  ) {
    this.route.data.subscribe((data: { accountData: any }) => {
      console.log(data.accountData);
      this.clientsData = [];
    });
  }

  ngOnInit(): void {
    console.log('Create');
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
      amount: [
        0,
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
}
