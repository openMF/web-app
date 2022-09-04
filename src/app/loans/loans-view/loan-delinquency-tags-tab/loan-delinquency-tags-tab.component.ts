import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-loan-delinquency-tags-tab',
  templateUrl: './loan-delinquency-tags-tab.component.html',
  styleUrls: ['./loan-delinquency-tags-tab.component.scss']
})
export class LoanDelinquencyTagsTabComponent implements OnInit {

  loanDelinquencyTags: any;
  loanDelinquencyTagsColumns: string[] = ['classification', 'addedOn', 'liftedOn'];

  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe((data: { loanDelinquencyTagsData: any }) => {
      this.loanDelinquencyTags = data.loanDelinquencyTagsData;
    });
  }

  ngOnInit(): void {
  }

}
