import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlimDetailsStepComponent } from './glim-details-step.component';

describe('GlimDetailsStepComponent', () => {
  let component: GlimDetailsStepComponent;
  let fixture: ComponentFixture<GlimDetailsStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlimDetailsStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlimDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
