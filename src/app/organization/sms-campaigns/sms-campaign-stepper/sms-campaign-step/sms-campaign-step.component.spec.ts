import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SmsCampaignStepComponent } from './sms-campaign-step.component';

describe('SmsCampaignStepComponent', () => {
  let component: SmsCampaignStepComponent;
  let fixture: ComponentFixture<SmsCampaignStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SmsCampaignStepComponent ]
    })
    .compileComponents();
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
