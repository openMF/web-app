import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTellerComponent } from './view-teller.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('ViewTellerComponent', () => {
  let component: ViewTellerComponent;
  let fixture: ComponentFixture<ViewTellerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewTellerComponent],
      imports: [
        HttpClientModule,
        CommonModule,
        ReactiveFormsModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
