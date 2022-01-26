import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoansAccountChargesStepComponent } from './loans-account-charges-step.component';

describe('LoansAccountChargesStepComponent', () => {
  let component: LoansAccountChargesStepComponent;
  let fixture: ComponentFixture<LoansAccountChargesStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoansAccountChargesStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoansAccountChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
