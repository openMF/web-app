import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignMessageStepComponent } from './campaign-message-step.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('CampaignMessageStepComponent', () => {
  let component: CampaignMessageStepComponent;
  let fixture: ComponentFixture<CampaignMessageStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CampaignMessageStepComponent],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignMessageStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
