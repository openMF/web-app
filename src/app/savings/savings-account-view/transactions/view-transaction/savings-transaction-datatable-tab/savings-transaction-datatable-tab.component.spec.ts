import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsTransactionDatatableTabComponent } from './savings-transaction-datatable-tab.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('SavingsTransactionDatatableTabComponent', () => {
  let component: SavingsTransactionDatatableTabComponent;
  let fixture: ComponentFixture<SavingsTransactionDatatableTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavingsTransactionDatatableTabComponent],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SavingsTransactionDatatableTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
