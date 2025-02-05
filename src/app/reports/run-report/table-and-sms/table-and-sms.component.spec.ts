import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableAndSmsComponent } from './table-and-sms.component';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

describe('TableAndSmsComponent', () => {
  let component: TableAndSmsComponent;
  let fixture: ComponentFixture<TableAndSmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TableAndSmsComponent],
      imports: [
        HttpClientModule,
        MatDialogModule,
        MatProgressBarModule,
        CommonModule
      ],
      providers: [
        DecimalPipe,
        { provide: MAT_DIALOG_DATA, useValue: {} }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableAndSmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
