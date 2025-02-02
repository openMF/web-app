import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChargeRecurringDepositsAccountComponent } from './add-charge-recurring-deposits-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('AddChargeRecurringDepositsAccountComponent', () => {
  let component: AddChargeRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<AddChargeRecurringDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddChargeRecurringDepositsAccountComponent],
      imports: [ReactiveFormsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
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
