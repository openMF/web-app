import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RejectRecurringDepositsAccountComponent } from './reject-recurring-deposits-account.component';

describe('RejectRecurringDepositsAccountComponent', () => {
  let component: RejectRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<RejectRecurringDepositsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectRecurringDepositsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectRecurringDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
