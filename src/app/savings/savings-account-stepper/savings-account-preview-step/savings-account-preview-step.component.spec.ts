import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsAccountPreviewStepComponent } from './savings-account-preview-step.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('SavingsAccountPreviewStepComponent', () => {
  let component: SavingsAccountPreviewStepComponent;
  let fixture: ComponentFixture<SavingsAccountPreviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingsAccountPreviewStepComponent],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsAccountPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
