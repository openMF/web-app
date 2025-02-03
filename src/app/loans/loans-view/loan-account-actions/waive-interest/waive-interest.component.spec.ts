import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaiveInterestComponent } from './waive-interest.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('WaiveInterestComponent', () => {
  let component: WaiveInterestComponent;
  let fixture: ComponentFixture<WaiveInterestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WaiveInterestComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
        TranslateModule
      ],
      providers: [
        DatePipe,
        TranslateService
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaiveInterestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
