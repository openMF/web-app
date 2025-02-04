import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProductMixComponent } from './view-product-mix.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('ViewProductMixComponent', () => {
  let component: ViewProductMixComponent;
  let fixture: ComponentFixture<ViewProductMixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewProductMixComponent],
      imports: [
        MatDialogModule,
        HttpClientModule,
        RouterTestingModule,
        ReactiveFormsModule,
        CommonModule,
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewProductMixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
