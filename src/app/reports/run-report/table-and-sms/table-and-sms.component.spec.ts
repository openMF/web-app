import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableAndSmsComponent } from './table-and-sms.component';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';

describe('TableAndSmsComponent', () => {
  let component: TableAndSmsComponent;
  let fixture: ComponentFixture<TableAndSmsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TableAndSmsComponent],
      imports: [
        HttpClientModule,
        MatDialogModule
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
