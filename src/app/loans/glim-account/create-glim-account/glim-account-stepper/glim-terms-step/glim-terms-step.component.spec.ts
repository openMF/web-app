import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlimTermsStepComponent } from './glim-terms-step.component';

describe('GlimTermsStepComponent', () => {
  let component: GlimTermsStepComponent;
  let fixture: ComponentFixture<GlimTermsStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlimTermsStepComponent ]
    })
    .compileComponents();
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
