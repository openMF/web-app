import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PrematureCloseRecurringDepositAccountComponent } from './premature-close-recurring-deposit-account.component';

describe('PrematureCloseRecurringDepositAccountComponent', () => {
  let component: PrematureCloseRecurringDepositAccountComponent;
  let fixture: ComponentFixture<PrematureCloseRecurringDepositAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PrematureCloseRecurringDepositAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrematureCloseRecurringDepositAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
