import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargesTabComponent } from './charges-tab.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common'; // Importar DatePipe
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('ChargesTabComponent', () => {
  let component: ChargesTabComponent;
  let fixture: ComponentFixture<ChargesTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChargesTabComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        MatDialogModule
      ],
      providers: [
        DatePipe,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
