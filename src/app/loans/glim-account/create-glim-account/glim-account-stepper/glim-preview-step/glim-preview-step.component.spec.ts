import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlimPreviewStepComponent } from './glim-preview-step.component';

describe('GlimPreviewStepComponent', () => {
  let component: GlimPreviewStepComponent;
  let fixture: ComponentFixture<GlimPreviewStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlimPreviewStepComponent ]
    })
    .compileComponents();
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
