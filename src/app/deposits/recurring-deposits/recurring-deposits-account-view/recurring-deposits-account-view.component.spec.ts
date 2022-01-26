import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecurringDepositsAccountViewComponent } from './recurring-deposits-account-view.component';

describe('RecurringDepositsAccountViewComponent', () => {
  let component: RecurringDepositsAccountViewComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositsAccountViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositsAccountViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
