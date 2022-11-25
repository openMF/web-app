import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAccountScheduleStepComponent } from './loans-account-schedule-step.component';

describe('LoansAccountScheduleStepComponent', () => {
  let component: LoansAccountScheduleStepComponent;
  let fixture: ComponentFixture<LoansAccountScheduleStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoansAccountScheduleStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoansAccountScheduleStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
