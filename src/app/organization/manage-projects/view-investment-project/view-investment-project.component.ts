import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-view-investment-project',
  templateUrl: './view-investment-project.component.html',
  styleUrls: ['./view-investment-project.component.scss']
})
export class ViewInvestmentProjectComponent {
  projectData: any;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { accountData: any }) => {
      this.projectData = data.accountData;
    });
  }
}
