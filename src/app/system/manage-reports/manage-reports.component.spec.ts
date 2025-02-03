import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageReportsComponent } from './manage-reports.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('ManageReportsComponent', () => {
  let component: ManageReportsComponent;
  let fixture: ComponentFixture<ManageReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageReportsComponent],
      imports: [
        RouterTestingModule,
        OverlayModule,
        MatDialogModule
      ],
      providers: [
        MatDialogRef,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
