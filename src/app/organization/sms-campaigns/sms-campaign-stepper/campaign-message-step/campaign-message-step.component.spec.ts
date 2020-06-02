import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignMessageStepComponent } from './campaign-message-step.component';

describe('CampaignMessageStepComponent', () => {
  let component: CampaignMessageStepComponent;
  let fixture: ComponentFixture<CampaignMessageStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignMessageStepComponent ]
    })
    .compileComponents();
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
