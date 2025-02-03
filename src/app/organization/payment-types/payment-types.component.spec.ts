import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentTypesComponent } from './payment-types.component';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('PaymentTypesComponent', () => {
  let component: PaymentTypesComponent;
  let fixture: ComponentFixture<PaymentTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentTypesComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        MatDialogModule
      ],
      providers: [
        DatePipe,
        MatDialogRef
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
