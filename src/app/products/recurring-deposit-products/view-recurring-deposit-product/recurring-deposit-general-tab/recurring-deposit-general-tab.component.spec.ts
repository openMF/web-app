import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositGeneralTabComponent } from './recurring-deposit-general-tab.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';
import { FormatNumberPipe } from 'app/pipes/format-number.pipe';
import { PipesModule } from 'app/pipes/pipes.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('RecurringDepositGeneralTabComponent', () => {
  let component: RecurringDepositGeneralTabComponent;
  let fixture: ComponentFixture<RecurringDepositGeneralTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecurringDepositGeneralTabComponent],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        PipesModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        FormatNumberPipe,
        DecimalPipe,
        DatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
