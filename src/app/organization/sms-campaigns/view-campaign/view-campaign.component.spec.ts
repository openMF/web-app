import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCampaignComponent } from './view-campaign.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewCampaignComponent', () => {
  let component: ViewCampaignComponent;
  let fixture: ComponentFixture<ViewCampaignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCampaignComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
