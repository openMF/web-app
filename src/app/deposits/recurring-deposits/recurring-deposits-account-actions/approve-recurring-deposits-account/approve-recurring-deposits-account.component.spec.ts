import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveRecurringDepositsAccountComponent } from './approve-recurring-deposits-account.component';

describe('ApproveRecurringDepositsAccountComponent', () => {
  let component: ApproveRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<ApproveRecurringDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveRecurringDepositsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveRecurringDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
