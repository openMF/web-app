import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositsAccountChargesStepComponent } from './recurring-deposits-account-charges-step.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

describe('RecurringDepositsAccountChargesStepComponent', () => {
  let component: RecurringDepositsAccountChargesStepComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountChargesStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositsAccountChargesStepComponent],
      imports: [MatDialogModule],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositsAccountChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
