import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlimTermsStepComponent } from './glim-terms-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('GlimTermsStepComponent', () => {
  let component: GlimTermsStepComponent;
  let fixture: ComponentFixture<GlimTermsStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlimTermsStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        DatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlimTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
