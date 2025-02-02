import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductPreviewStepComponent } from './share-product-preview-step.component';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('ShareProductPreviewStepComponent', () => {
  let component: ShareProductPreviewStepComponent;
  let fixture: ComponentFixture<ShareProductPreviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShareProductPreviewStepComponent],
      imports: [TranslateModule],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
