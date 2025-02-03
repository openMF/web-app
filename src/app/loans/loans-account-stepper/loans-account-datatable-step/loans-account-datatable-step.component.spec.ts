import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAccountDatatableStepComponent } from './loans-account-datatable-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('LoansAccountDatatableStepComponent', () => {
  let component: LoansAccountDatatableStepComponent;
  let fixture: ComponentFixture<LoansAccountDatatableStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoansAccountDatatableStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule
      ],
      providers: [
        DatePipe,
        TranslateService
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
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
