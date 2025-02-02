import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFixedDepositAccountComponent } from './create-fixed-deposit-account.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';

describe('CreateFixedDepositAccountComponent', () => {
  let component: CreateFixedDepositAccountComponent;
  let fixture: ComponentFixture<CreateFixedDepositAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateFixedDepositAccountComponent],
      providers: [
        DatePipe,
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
    fixture = TestBed.createComponent(CreateFixedDepositAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
