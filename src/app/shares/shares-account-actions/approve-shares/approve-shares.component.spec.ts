import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveSharesComponent } from './approve-shares.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('ApproveSharesComponent', () => {
  let component: ApproveSharesComponent;
  let fixture: ComponentFixture<ApproveSharesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApproveSharesComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        MatDialogModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveSharesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
