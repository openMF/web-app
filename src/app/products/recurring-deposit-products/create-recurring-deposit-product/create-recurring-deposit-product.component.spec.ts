import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRecurringDepositProductComponent } from './create-recurring-deposit-product.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('CreateRecurringDepositProductComponent', () => {
  let component: CreateRecurringDepositProductComponent;
  let fixture: ComponentFixture<CreateRecurringDepositProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateRecurringDepositProductComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule
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
    fixture = TestBed.createComponent(CreateRecurringDepositProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
