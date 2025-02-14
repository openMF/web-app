import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChargeRecurringDepositsAccountComponent } from './add-charge-recurring-deposits-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

describe('AddChargeRecurringDepositsAccountComponent', () => {
  let component: AddChargeRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<AddChargeRecurringDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddChargeRecurringDepositsAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule
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
    fixture = TestBed.createComponent(AddChargeRecurringDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
