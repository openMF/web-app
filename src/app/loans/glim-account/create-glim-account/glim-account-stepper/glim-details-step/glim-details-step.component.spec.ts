import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlimDetailsStepComponent } from './glim-details-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('GlimDetailsStepComponent', () => {
  let component: GlimDetailsStepComponent;
  let fixture: ComponentFixture<GlimDetailsStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlimDetailsStepComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
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
