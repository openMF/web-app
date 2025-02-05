import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';

import { RepaymentScheduleTabComponent } from './repayment-schedule-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('RepaymentScheduleTabComponent', () => {
  let component: RepaymentScheduleTabComponent;
  let fixture: ComponentFixture<RepaymentScheduleTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RepaymentScheduleTabComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        },
        DatePipe

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepaymentScheduleTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
