import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlimDetailsStepComponent } from './glim-details-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('GlimDetailsStepComponent', () => {
  let component: GlimDetailsStepComponent;
  let fixture: ComponentFixture<GlimDetailsStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlimDetailsStepComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [DatePipe]
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
