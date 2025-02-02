import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductAccountingStepComponent } from './share-product-accounting-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

describe('ShareProductAccountingStepComponent', () => {
  let component: ShareProductAccountingStepComponent;
  let fixture: ComponentFixture<ShareProductAccountingStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShareProductAccountingStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductAccountingStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
