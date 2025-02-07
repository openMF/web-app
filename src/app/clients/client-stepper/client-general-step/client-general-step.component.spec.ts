import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientGeneralStepComponent } from './client-general-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ClientGeneralStepComponent', () => {
  let component: ClientGeneralStepComponent;
  let fixture: ComponentFixture<ClientGeneralStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClientGeneralStepComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientGeneralStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
