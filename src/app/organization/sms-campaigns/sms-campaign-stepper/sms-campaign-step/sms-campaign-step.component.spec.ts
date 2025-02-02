import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsCampaignStepComponent } from './sms-campaign-step.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('SmsCampaignStepComponent', () => {
  let component: SmsCampaignStepComponent;
  let fixture: ComponentFixture<SmsCampaignStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SmsCampaignStepComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmsCampaignStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
