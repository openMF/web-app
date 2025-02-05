import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanScreenReportsComponent } from './loan-screen-reports.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

describe('LoanScreenReportsComponent', () => {
  let component: LoanScreenReportsComponent;
  let fixture: ComponentFixture<LoanScreenReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoanScreenReportsComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanScreenReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
