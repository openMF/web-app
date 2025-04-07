import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mifosx-create-investment-project',
  templateUrl: './create-investment-project.component.html',
  styleUrls: ['./create-investment-project.component.scss']
})
export class CreateInvestmentProjectComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    console.log('Create');
  }
}
