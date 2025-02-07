import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFixedDepositAccountComponent } from './edit-fixed-deposit-account.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';

describe('EditFixedDepositAccountComponent', () => {
  let component: EditFixedDepositAccountComponent;
  let fixture: ComponentFixture<EditFixedDepositAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditFixedDepositAccountComponent],
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
    fixture = TestBed.createComponent(EditFixedDepositAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
