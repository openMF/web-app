import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailComponent } from './email.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('EmailComponent', () => {
  let component: EmailComponent;
  let fixture: ComponentFixture<EmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EmailComponent],
      imports: [
        RouterTestingModule,
        TranslateModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
