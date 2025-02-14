import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlimPreviewStepComponent } from './glim-preview-step.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('GlimPreviewStepComponent', () => {
  let component: GlimPreviewStepComponent;
  let fixture: ComponentFixture<GlimPreviewStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlimPreviewStepComponent],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlimPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
