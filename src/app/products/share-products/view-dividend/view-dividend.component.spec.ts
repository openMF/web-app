import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDividendComponent } from './view-dividend.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('ViewDividendComponent', () => {
  let component: ViewDividendComponent;
  let fixture: ComponentFixture<ViewDividendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewDividendComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        CommonModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDividendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
