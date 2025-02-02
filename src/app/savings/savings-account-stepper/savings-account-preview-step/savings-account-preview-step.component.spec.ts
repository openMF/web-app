import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsAccountPreviewStepComponent } from './savings-account-preview-step.component';
import { TranslateModule } from '@ngx-translate/core';

describe('SavingsAccountPreviewStepComponent', () => {
  let component: SavingsAccountPreviewStepComponent;
  let fixture: ComponentFixture<SavingsAccountPreviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingsAccountPreviewStepComponent],
      imports: [TranslateModule]
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
