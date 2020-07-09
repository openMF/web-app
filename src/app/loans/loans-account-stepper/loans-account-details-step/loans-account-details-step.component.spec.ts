import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAccountDetailsStepComponent } from './loans-account-details-step.component';

describe('LoansAccountDetailsStepComponent', () => {
  let component: LoansAccountDetailsStepComponent;
  let fixture: ComponentFixture<LoansAccountDetailsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoansAccountDetailsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoansAccountDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
