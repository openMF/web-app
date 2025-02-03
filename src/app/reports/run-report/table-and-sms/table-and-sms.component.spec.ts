import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableAndSmsComponent } from './table-and-sms.component';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule, DecimalPipe } from '@angular/common';

describe('TableAndSmsComponent', () => {
  let component: TableAndSmsComponent;
  let fixture: ComponentFixture<TableAndSmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TableAndSmsComponent],
      imports: [
        HttpClientModule,
        MatDialogModule,
        CommonModule
      ],
      providers: [
        DecimalPipe
      ]
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
