import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTellerComponent } from './create-teller.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('CreateTellerComponent', () => {
  let component: CreateTellerComponent;
  let fixture: ComponentFixture<CreateTellerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateTellerComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        CommonModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [DatePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
