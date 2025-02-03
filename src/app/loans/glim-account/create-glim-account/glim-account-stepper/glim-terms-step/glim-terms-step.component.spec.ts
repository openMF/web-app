import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlimTermsStepComponent } from './glim-terms-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('GlimTermsStepComponent', () => {
  let component: GlimTermsStepComponent;
  let fixture: ComponentFixture<GlimTermsStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlimTermsStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule
      ],
      providers: [
        DatePipe,
        TranslateService
      ]
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
