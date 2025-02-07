import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsTransactionGeneralTabComponent } from './savings-transaction-general-tab.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SavingsTransactionGeneralTabComponent', () => {
  let component: SavingsTransactionGeneralTabComponent;
  let fixture: ComponentFixture<SavingsTransactionGeneralTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavingsTransactionGeneralTabComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        ReactiveFormsModule,
        CommonModule,
        MatDialogModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        DatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SavingsTransactionGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
