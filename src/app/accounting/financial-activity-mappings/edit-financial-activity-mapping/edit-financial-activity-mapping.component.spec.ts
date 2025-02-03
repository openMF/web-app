import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFinancialActivityMappingComponent } from './edit-financial-activity-mapping.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AccountingService } from 'app/accounting/accounting.service';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('EditFinancialActivityMappingComponent', () => {
  let component: EditFinancialActivityMappingComponent;
  let fixture: ComponentFixture<EditFinancialActivityMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditFinancialActivityMappingComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule
      ],
      providers: [AccountingService],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFinancialActivityMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
