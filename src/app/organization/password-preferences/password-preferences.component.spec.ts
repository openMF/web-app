import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordPreferencesComponent } from './password-preferences.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('PasswordPreferencesComponent', () => {
  let component: PasswordPreferencesComponent;
  let fixture: ComponentFixture<PasswordPreferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PasswordPreferencesComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        TranslateModule,
        RouterTestingModule
      ],
      providers: [DatePipe],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
