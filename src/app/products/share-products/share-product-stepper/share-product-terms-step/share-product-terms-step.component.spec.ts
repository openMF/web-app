import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductTermsStepComponent } from './share-product-terms-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('ShareProductTermsStepComponent', () => {
  let component: ShareProductTermsStepComponent;
  let fixture: ComponentFixture<ShareProductTermsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShareProductTermsStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
