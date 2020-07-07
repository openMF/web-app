import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateRecurringDepositsAccountComponent } from './activate-recurring-deposits-account.component';

describe('ActivateRecurringDepositsAccountComponent', () => {
  let component: ActivateRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<ActivateRecurringDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivateRecurringDepositsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateRecurringDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
