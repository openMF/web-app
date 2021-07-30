import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAccountScorecardStepComponent } from './loans-account-scorecard-step.component';

describe('LoansAccountScorecardStepComponent', () => {
  let component: LoansAccountScorecardStepComponent;
  let fixture: ComponentFixture<LoansAccountScorecardStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoansAccountScorecardStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoansAccountScorecardStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
