import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsCampaignsComponent } from './sms-campaigns.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('SmsCampaignsComponent', () => {
  let component: SmsCampaignsComponent;
  let fixture: ComponentFixture<SmsCampaignsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SmsCampaignsComponent],
      imports: [
        RouterTestingModule,
        TranslateModule
      ]
    }).compileComponents();
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
