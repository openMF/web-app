import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoanProductSettingsStepComponent } from './loan-product-settings-step.component';

describe('LoanProductSettingsStepComponent', () => {
  let component: LoanProductSettingsStepComponent;
  let fixture: ComponentFixture<LoanProductSettingsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanProductSettingsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductSettingsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
