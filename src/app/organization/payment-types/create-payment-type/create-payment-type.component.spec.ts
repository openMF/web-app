import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePaymentTypeComponent } from './create-payment-type.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';

describe('CreatePaymentTypeComponent', () => {
  let component: CreatePaymentTypeComponent;
  let fixture: ComponentFixture<CreatePaymentTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreatePaymentTypeComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule
      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePaymentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
