import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEnityDataTableChecksComponent } from './create-enity-data-table-checks.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('CreateEnityDataTableChecksComponent', () => {
  let component: CreateEnityDataTableChecksComponent;
  let fixture: ComponentFixture<CreateEnityDataTableChecksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEnityDataTableChecksComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEnityDataTableChecksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
