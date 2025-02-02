import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAccountScheduleStepComponent } from './loans-account-schedule-step.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

describe('LoansAccountScheduleStepComponent', () => {
  let component: LoansAccountScheduleStepComponent;
  let fixture: ComponentFixture<LoansAccountScheduleStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoansAccountScheduleStepComponent],
      imports: [
        HttpClientModule,
        CommonModule
      ]
    }).compileComponents();
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
