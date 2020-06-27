import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanRescheduleComponent } from './loan-reschedule.component';

describe('LoanRescheduleComponent', () => {
  let component: LoanRescheduleComponent;
  let fixture: ComponentFixture<LoanRescheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanRescheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanRescheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
