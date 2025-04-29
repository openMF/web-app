import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-investment-project-general-tab',
  templateUrl: './investment-project-general-tab.component.html',
  styleUrls: ['./investment-project-general-tab.component.scss']
})
export class InvestmentProjectGeneralTabComponent {
  projectData: any;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { accountData: any }) => {
      this.projectData = data.accountData;
    });
  }
}
