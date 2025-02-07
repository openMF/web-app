import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelinquencyRangeComponent } from './delinquency-range.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('DelinquencyRangeComponent', () => {
  let component: DelinquencyRangeComponent;
  let fixture: ComponentFixture<DelinquencyRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DelinquencyRangeComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        CommonModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DelinquencyRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
