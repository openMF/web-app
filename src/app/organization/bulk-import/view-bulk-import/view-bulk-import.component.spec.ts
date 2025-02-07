import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBulkImportComponent } from './view-bulk-import.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

describe('ViewBulkImportComponent', () => {
  let component: ViewBulkImportComponent;
  let fixture: ComponentFixture<ViewBulkImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewBulkImportComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule
      ],
      providers: [
        DatePipe,
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
    fixture = TestBed.createComponent(ViewBulkImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
