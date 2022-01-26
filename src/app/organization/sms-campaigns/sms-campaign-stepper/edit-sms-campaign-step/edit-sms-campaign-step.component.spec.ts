import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditSmsCampaignStepComponent } from './edit-sms-campaign-step.component';

describe('EditSmsCampaignStepComponent', () => {
  let component: EditSmsCampaignStepComponent;
  let fixture: ComponentFixture<EditSmsCampaignStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSmsCampaignStepComponent ]
    })
    .compileComponents();
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
