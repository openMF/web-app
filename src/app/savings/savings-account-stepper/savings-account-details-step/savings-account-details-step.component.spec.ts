import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsAccountDetailsStepComponent } from './savings-account-details-step.component';

describe('SavingsAccountDetailsStepComponent', () => {
  let component: SavingsAccountDetailsStepComponent;
  let fixture: ComponentFixture<SavingsAccountDetailsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingsAccountDetailsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsAccountDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
