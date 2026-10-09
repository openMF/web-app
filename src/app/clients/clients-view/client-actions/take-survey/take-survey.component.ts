/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ClientsService } from '../../../clients.service';
import { ClientActionNotifierService } from '../client-action-notifier.service';
import { AuthenticationService } from '../../../../core/authentication/authentication.service';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TakeSurveyComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly clientsService = inject(ClientsService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly notifier = inject(ClientActionNotifierService);
  private destroyRef = inject(DestroyRef);

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
  formData: {
    userId: Number;
    clientId: Number;
    surveyId: Number;
    scorecardValues: { questionId: Number; responseId: Number; value: String }[];
    surveyName: String;
    username: String;
    id: Number;
  };

  /**
   * Retrieves the survey data from `resolve`.
   * @param {ActivatedRoute} route Activated Route
   * @param {ClientsService} clientsService ClientsService
   * @param {AuthenticationService} authenticationService AuthenticationService
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { clientActionData: any }) => {
      this.allSurveyData = data.clientActionData;
      this.clientId = this.route.parent.snapshot.params['clientId'];
    });
    /** Retrieves User ID */
    const savedCredentials = this.authenticationService.getCredentials();
    this.userId = savedCredentials.userId;
  }

  /**
   * Handles survey selection change. Updates surveyData and groups
   * questions by their componentKey for sectioned display.
   */
  onSurveyChange(resEvent: any) {
    if (resEvent.value) {
      this.surveyData = resEvent.value;
      const result = this.groupBy(this.surveyData.questionDatas, function (item: any) {
        return [item.componentKey];
      });

      this.componentGroups = result;
    }
  }

  /**
   * Groups an array of objects by the value returned from a key function.
   * @param array The array to group.
   * @param func A function returning the grouping key for each element.
   * @returns An array of grouped sub-arrays.
   */
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
    if (this.surveyData && this.surveyData.questionDatas) {
      return !this.surveyData.questionDatas.some((element: any) => element.answer);
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
        const tmp = {
          questionId: elem.id,
          responseId: elem.answer.id,
          value: elem.answer.value,
          createdOn: new Date().getTime()
        };
        this.formData.scorecardValues.push(tmp);
      }
    });

    this.clientsService.createNewSurvey(this.surveyData.id, this.formData).subscribe({
      next: () => this.notifier.notifyAndNavigate('clients.actions.takeSurvey.success', this.route, ['../../general']),
      error: () => this.notifier.notify('clients.actions.takeSurvey.failure')
    });
  }
}
