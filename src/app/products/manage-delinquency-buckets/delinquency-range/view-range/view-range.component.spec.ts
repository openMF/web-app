import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ViewRangeComponent } from './view-range.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewRangeComponent', () => {
  let component: ViewRangeComponent;
  let fixture: ComponentFixture<ViewRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewRangeComponent],
      imports: [
        RouterTestingModule,
        MatDialogModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
