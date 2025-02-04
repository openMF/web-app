import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionPaymentDetailComponent } from './transaction-payment-detail.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('TransactionPaymentDetailComponent', () => {
  let component: TransactionPaymentDetailComponent;
  let fixture: ComponentFixture<TransactionPaymentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionPaymentDetailComponent],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionPaymentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
