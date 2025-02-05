import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RescheduleLoanComponent } from './reschedule-loan.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

describe('RescheduleLoanComponent', () => {
  let component: RescheduleLoanComponent;
  let fixture: ComponentFixture<RescheduleLoanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RescheduleLoanComponent],
      imports: [
        RouterTestingModule,
        MatDialogModule
      ],
      providers: [
        DatePipe,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RescheduleLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
