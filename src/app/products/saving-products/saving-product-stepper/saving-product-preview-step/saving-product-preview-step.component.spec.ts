import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductPreviewStepComponent } from './saving-product-preview-step.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SavingProductPreviewStepComponent', () => {
  let component: SavingProductPreviewStepComponent;
  let fixture: ComponentFixture<SavingProductPreviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingProductPreviewStepComponent],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
