import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFixedDepositAccountComponent } from './create-fixed-deposit-account.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

describe('CreateFixedDepositAccountComponent', () => {
  let component: CreateFixedDepositAccountComponent;
  let fixture: ComponentFixture<CreateFixedDepositAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateFixedDepositAccountComponent],
      imports: [HttpClientModule],
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
    fixture = TestBed.createComponent(CreateFixedDepositAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
