import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewClosureComponent } from './view-closure.component';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

describe('ViewClosureComponent', () => {
  let component: ViewClosureComponent;
  let fixture: ComponentFixture<ViewClosureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewClosureComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
        CommonModule,
        MatDialogModule
      ],
      providers: [
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
    fixture = TestBed.createComponent(ViewClosureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
