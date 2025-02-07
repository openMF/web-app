import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SavingsAccountUnassignStaffComponent } from './savings-account-unassign-staff.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

describe('SavingsAccountUnassignStaffComponent', () => {
  let component: SavingsAccountUnassignStaffComponent;
  let fixture: ComponentFixture<SavingsAccountUnassignStaffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingsAccountUnassignStaffComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [DatePipe],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsAccountUnassignStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
