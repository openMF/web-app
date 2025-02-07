import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDividendComponent } from './create-dividend.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

describe('CreateDividendComponent', () => {
  let component: CreateDividendComponent;
  let fixture: ComponentFixture<CreateDividendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateDividendComponent],
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
        },
        DatePipe

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDividendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
