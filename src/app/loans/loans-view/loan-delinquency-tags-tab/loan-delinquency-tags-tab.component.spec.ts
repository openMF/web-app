import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanDelinquencyTagsTabComponent } from './loan-delinquency-tags-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('LoanDelinquencyTagsTabComponent', () => {
  let component: LoanDelinquencyTagsTabComponent;
  let fixture: ComponentFixture<LoanDelinquencyTagsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanDelinquencyTagsTabComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanDelinquencyTagsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
