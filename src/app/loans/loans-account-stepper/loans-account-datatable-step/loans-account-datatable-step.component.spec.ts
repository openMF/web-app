import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAccountDatatableStepComponent } from './loans-account-datatable-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('LoansAccountDatatableStepComponent', () => {
  let component: LoansAccountDatatableStepComponent;
  let fixture: ComponentFixture<LoansAccountDatatableStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoansAccountDatatableStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        DatePipe,
        TranslateService
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoansAccountDatatableStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
