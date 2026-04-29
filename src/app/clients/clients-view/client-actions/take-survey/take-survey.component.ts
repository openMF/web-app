/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { ScoreCardService } from '@fineract/client';
import { ScorecardData } from '@fineract/client';
import { ScorecardValue } from '@fineract/client';
import { AuthenticationService } from '../../../../core/authentication/authentication.service';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Take Survey Component
 */
@Component({
  selector: 'mifosx-take-survey',
  templateUrl: './take-survey.component.html',
  styleUrls: ['./take-survey.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatRadioGroup,
    FormsModule,
    MatRadioButton
  ]
})
export class TakeSurveyComponent {
  /** List of all Survey Data */
  allSurveyData: any;
  /** User Id */
  userId: any;
  /** Particular Survey Data */
  surveyData: any;
  /** Stores the response from the user */
  componentGroups: any[];
  /** Client ID */
  clientId: any;
  /** Stores the value to send to the API */
  formData: ScorecardData;

  /**
   * Retrieves the survey data from `resolve`.
   * @param {ActivatedRoute} route Activated Route
   * @param {ClientsService} clientsService ClientsService
   * @param {Router} router Router
   * @param {AuthenticationService} authenticationService AuthenticationService
   */
  constructor(
    private route: ActivatedRoute,
    private scoreCardService: ScoreCardService,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.allSurveyData = data.clientActionData;
      this.clientId = this.route.parent.snapshot.params['clientId'];
    });
    /** Retrieves User ID */
    const savedCredentials = this.authenticationService.getCredentials();
    this.userId = savedCredentials.userId;
  }

  // TODO: document the function
  onSurveyChange(resEvent: any) {
    if (resEvent.value) {
      this.surveyData = resEvent.value;
      const result = this.groupBy(this.surveyData.questionDatas, function (item: any) {
        return [item.componentKey];
      });

      this.componentGroups = result;
    }
  }

  // TODO: document the function
  groupBy(array: any, func: any) {
    const groups: { [key: string]: any[] } = {};
    array.forEach((ele: any) => {
      const group = JSON.stringify(func(ele));
      groups[group] = groups[group] || [];
      groups[group].push(ele);
    });
    return Object.keys(groups).map(function (group: any) {
      return groups[group];
    });
  }

  /**
   * Checks if there is any response or not from the user and enables the submit button accordingly
   */
  isAnyResponse(): boolean {
    if (this.surveyData) {
      this.surveyData.questionDatas.forEach((element: any) => {
        if (element.answer) {
          return false;
        }
      });
    }
    return true;
  }

  /**
   * Submits the user survey response.
   */
  submit() {
    this.formData = {
      userId: this.userId,
      clientId: this.clientId,
      surveyId: this.surveyData.id,
      surveyName: '',
      username: '',
      id: 0,
      scorecardValues: []
    };

    this.surveyData.questionDatas.forEach((elem: any) => {
      if (elem.answer) {
        const tmp: ScorecardValue = {
          questionId: elem.id,
          responseId: elem.answer.id,
          value: Number(elem.answer.value),
          createdOn: new Date().toISOString()
        };
        this.formData.scorecardValues.push(tmp);
      }
    });

    this.scoreCardService
      .createScorecard1({
        surveyId: this.surveyData.id,
        scorecardData: this.formData
      })
      .subscribe(() => {
        this.router.navigate(['../../general'], { relativeTo: this.route });
      });
  }
}
