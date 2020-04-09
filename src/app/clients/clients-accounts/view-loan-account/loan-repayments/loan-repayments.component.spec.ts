import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanRepaymentsComponent } from './loan-repayments.component';

describe('LoanRepaymentsComponent', () => {
  let component: LoanRepaymentsComponent;
  let fixture: ComponentFixture<LoanRepaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanRepaymentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanRepaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
