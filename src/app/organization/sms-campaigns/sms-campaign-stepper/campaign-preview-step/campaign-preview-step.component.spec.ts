import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignPreviewStepComponent } from './campaign-preview-step.component';

describe('CampaignPreviewStepComponent', () => {
  let component: CampaignPreviewStepComponent;
  let fixture: ComponentFixture<CampaignPreviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignPreviewStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
