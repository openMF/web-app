import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDataTableComponent } from './create-data-table.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

describe('CreateDataTableComponent', () => {
  let component: CreateDataTableComponent;
  let fixture: ComponentFixture<CreateDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateDataTableComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule,
        MatDialogModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
