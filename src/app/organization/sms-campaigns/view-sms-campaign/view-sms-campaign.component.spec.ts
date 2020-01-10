import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSmsCampaignComponent } from './view-sms-campaigns.component';

describe('ViewSmsCampaignComponent', () => {
  let component: ViewSmsCampaignComponent;
  let fixture: ComponentFixture<ViewSmsCampaignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewSmsCampaignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSmsCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
