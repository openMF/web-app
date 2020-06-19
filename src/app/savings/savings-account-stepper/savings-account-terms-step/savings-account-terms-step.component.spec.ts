import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsAccountTermsStepComponent } from './savings-account-terms-step.component';

describe('SavingsAccountTermsStepComponent', () => {
  let component: SavingsAccountTermsStepComponent;
  let fixture: ComponentFixture<SavingsAccountTermsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingsAccountTermsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsAccountTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
