import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewAccountNumberPreferenceComponent } from './view-account-number-preference.component';

describe('ViewAccountNumberPreferenceComponent', () => {
  let component: ViewAccountNumberPreferenceComponent;
  let fixture: ComponentFixture<ViewAccountNumberPreferenceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAccountNumberPreferenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAccountNumberPreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
