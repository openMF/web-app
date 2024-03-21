import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'mifosx-qualification-rules-view',
  templateUrl: './qualification-rules-view.component.html',
  styleUrls: ['./qualification-rules-view.component.scss']
})
export class QualificationRulesViewComponent implements OnInit {
  @Input() loanProduct: any;
  @Input() loanTypeId: any;
  @Input() loanProductsTemplate: any;

  constructor() { }

  ngOnInit(): void {
  }

}
