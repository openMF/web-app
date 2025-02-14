import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanReamortizeComponent } from './loan-reamortize.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('LoanReamortizeComponent', () => {
  let component: LoanReamortizeComponent;
  let fixture: ComponentFixture<LoanReamortizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanReamortizeComponent],
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

    fixture = TestBed.createComponent(LoanReamortizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
