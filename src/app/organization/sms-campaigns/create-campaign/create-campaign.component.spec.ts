import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateCampaignComponent } from './create-campaign.component';

describe('CreateCampaignComponent', () => {
  let component: CreateCampaignComponent;
  let fixture: ComponentFixture<CreateCampaignComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCampaignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
