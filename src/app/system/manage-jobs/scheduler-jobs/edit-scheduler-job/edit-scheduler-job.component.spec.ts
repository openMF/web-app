import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';

import { EditSchedulerJobComponent } from './edit-scheduler-job.component';

describe('EditSchedulerJobComponent', () => {
  let component: EditSchedulerJobComponent;
  let fixture: ComponentFixture<EditSchedulerJobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditSchedulerJobComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSchedulerJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
