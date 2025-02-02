import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositsAccountDetailsStepComponent } from './recurring-deposits-account-details-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('RecurringDepositsAccountDetailsStepComponent', () => {
  let component: RecurringDepositsAccountDetailsStepComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountDetailsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositsAccountDetailsStepComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositsAccountDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
