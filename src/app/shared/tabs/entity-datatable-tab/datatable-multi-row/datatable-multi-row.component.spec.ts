import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableMultiRowComponent } from './datatable-multi-row.component';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

describe('DatatableMultiRowComponent', () => {
  let component: DatatableMultiRowComponent;
  let fixture: ComponentFixture<DatatableMultiRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatatableMultiRowComponent],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [DatePipe]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableMultiRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
