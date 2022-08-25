import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlimChargesStepComponent } from './glim-charges-step.component';

describe('GlimChargesStepComponent', () => {
  let component: GlimChargesStepComponent;
  let fixture: ComponentFixture<GlimChargesStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlimChargesStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlimChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
