import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateRecurringDepositsAccountComponent } from './create-recurring-deposits-account.component';

describe('CreateRecurringDepositsAccountComponent', () => {
  let component: CreateRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<CreateRecurringDepositsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateRecurringDepositsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRecurringDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
