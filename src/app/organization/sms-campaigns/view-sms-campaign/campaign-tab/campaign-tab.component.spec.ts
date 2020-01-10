import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignTabComponent } from './campaign-tab.component';

describe('CampaignTabComponent', () => {
  let component: CampaignTabComponent;
  let fixture: ComponentFixture<CampaignTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
