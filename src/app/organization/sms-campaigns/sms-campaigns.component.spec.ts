import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SmsCampaignsComponent } from './sms-campaigns.component';

describe('SmsCampaignsComponent', () => {
  let component: SmsCampaignsComponent;
  let fixture: ComponentFixture<SmsCampaignsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SmsCampaignsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmsCampaignsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
