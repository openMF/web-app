import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditCampaignComponent } from './edit-campaign.component';

describe('EditCampaignComponent', () => {
  let component: EditCampaignComponent;
  let fixture: ComponentFixture<EditCampaignComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCampaignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
