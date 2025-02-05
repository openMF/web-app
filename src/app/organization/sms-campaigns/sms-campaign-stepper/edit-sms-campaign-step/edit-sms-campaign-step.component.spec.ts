import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSmsCampaignStepComponent } from './edit-sms-campaign-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

describe('EditSmsCampaignStepComponent', () => {
  let component: EditSmsCampaignStepComponent;
  let fixture: ComponentFixture<EditSmsCampaignStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditSmsCampaignStepComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSmsCampaignStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
