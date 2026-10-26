import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TakeSurveyComponent } from './take-survey.component';
import { ClientsService } from 'app/clients/clients.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ClientActionNotifierService } from '../client-action-notifier.service';

import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('TakeSurveyComponent', () => {
  let component: TakeSurveyComponent;
  let fixture: ComponentFixture<TakeSurveyComponent>;

  let clientsService: jest.Mocked<ClientsService>;
  let authenticationService: jest.Mocked<AuthenticationService>;
  let notifier: jest.Mocked<ClientActionNotifierService>;

  const clientId = '456';
  const userId = 1;
  const surveyList = [
    {
      id: 10,
      name: 'Test Survey',
      questionDatas: [
        { id: 1, componentKey: 'A', answer: { id: 2, value: '5' } }
      ]
    }
  ];

  const setup = async () => {
    clientsService = {
      createNewSurvey: jest.fn(() => of({}))
    } as any;

    authenticationService = {
      getCredentials: jest.fn(() => ({ userId }))
    } as any;

    notifier = { notifyAndNavigate: jest.fn(), notify: jest.fn() } as any;

    await TestBed.configureTestingModule({
      imports: [
        TakeSurveyComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ clientActionData: surveyList }),
            parent: { snapshot: { params: { clientId } } }
          }
        },
        { provide: ClientsService, useValue: clientsService },
        { provide: AuthenticationService, useValue: authenticationService },
        { provide: ClientActionNotifierService, useValue: notifier },
        provideNativeDateAdapter(),
        provideAnimationsAsync()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TakeSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(setup);

  it('should initialize correctly', () => {
    expect(component.clientId).toBe(clientId);
    expect(component.userId).toBe(userId);
    expect(component.allSurveyData).toEqual(surveyList);
  });

  it('should call API with createNewSurvey on submit', () => {
    component.surveyData = surveyList[0];

    component.submit();

    expect(clientsService.createNewSurvey).toHaveBeenCalledWith(
      surveyList[0].id,
      expect.objectContaining({ userId, clientId, surveyId: surveyList[0].id })
    );
  });

  it('should notify and navigate after successful submission', () => {
    component.surveyData = surveyList[0];

    component.submit();

    expect(notifier.notifyAndNavigate).toHaveBeenCalledWith(
      'clients.actions.takeSurvey.success',
      TestBed.inject(ActivatedRoute),
      ['../../general']
    );
  });

  it('should show failure notification if API call fails', () => {
    clientsService.createNewSurvey.mockReturnValueOnce(throwError(() => new Error('API error')));
    component.surveyData = surveyList[0];

    component.submit();

    expect(notifier.notifyAndNavigate).not.toHaveBeenCalled();
    expect(notifier.notify).toHaveBeenCalledWith('clients.actions.takeSurvey.failure');
  });
});
