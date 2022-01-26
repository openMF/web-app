import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SavingsAccountChargesStepComponent } from './savings-account-charges-step.component';

describe('SavingsAccountChargesStepComponent', () => {
  let component: SavingsAccountChargesStepComponent;
  let fixture: ComponentFixture<SavingsAccountChargesStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingsAccountChargesStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsAccountChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
