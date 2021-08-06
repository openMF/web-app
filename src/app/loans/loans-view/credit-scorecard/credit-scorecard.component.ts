import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-credit-scorecard',
  templateUrl: './credit-scorecard.component.html',
  styleUrls: ['./credit-scorecard.component.scss']
})
export class CreditScorecardComponent implements OnInit {

  loanDetails: any;
  dataObject: {
    property: string,
    value: string
  }[];

  scorecard: any;

  mlScorecard: any;
  mlScorecardColumns: string[] = ['key', 'value'];
  mlScorecardData: any[];

  statScorecard: any;
  statScorecardColumns: string[] = ['key', 'value'];
  statScorecardData: any[];

  criteriaScoreTableColumns: string[] = ['feature', 'value', 'score', 'color'];
  criteriaScoreDataSource: any;

  ruleBasedScorecard: any;

  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe((data: { loanDetailsData: any, }) => {
      this.loanDetails = data.loanDetailsData;
    });
  }

  ngOnInit() {

    this.scorecard = this.loanDetails.scorecard;

    if (this.scorecard) {
      if (this.scorecard.scoringMethod === "ml") {
        this.mlScorecard = this.scorecard?.mlScorecard;
        this.setMLScorecardTableData();
      }

      if (this.scorecard.scoringMethod === "stat") {
        this.statScorecard = this.scorecard?.statScorecard;
        this.setStatScorecardTableData();
      }

      if (this.scorecard.scoringMethod === "ruleBased") {
        this.ruleBasedScorecard = this.scorecard?.ruleBasedScorecard;
        this.criteriaScoreDataSource = this.scorecard?.ruleBasedScorecard?.criteriaScores;
      }
    }

    console.log(this);

  }

  setMLScorecardTableData() {
    this.mlScorecardData = [
      {
        'key': 'Predicted Risk',
        'value': this.mlScorecard?.risk
      },
      {
        'key': 'Accuracy',
        'value': this.mlScorecard?.accuracy
      },
      {
        'key': 'Scoring Model',
        'value': this.scorecard?.scoringModel
      },
    ];
  }

  setStatScorecardTableData() {
    this.statScorecardData = [
      {
        'key': 'Color',
        'value': this.statScorecard?.color
      },
      {
        'key': 'Accuracy',
        'value': this.statScorecard?.prediction
      },
      {
        'key': 'Scoring Model',
        'value': this.scorecard?.scoringModel
      },
    ];
  }

}
