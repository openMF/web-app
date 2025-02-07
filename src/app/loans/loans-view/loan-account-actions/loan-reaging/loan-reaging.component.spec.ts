import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanReagingComponent } from './loan-reaging.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('LoanReagingComponent', () => {
  let component: LoanReagingComponent;
  let fixture: ComponentFixture<LoanReagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanReagingComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        DatePipe,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanReagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
