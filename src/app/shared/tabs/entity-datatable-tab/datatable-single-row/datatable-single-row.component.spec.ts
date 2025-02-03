import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableSingleRowComponent } from './datatable-single-row.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('DatatableSingleRowComponent', () => {
  let component: DatatableSingleRowComponent;
  let fixture: ComponentFixture<DatatableSingleRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatatableSingleRowComponent],
      imports: [
        CommonModule,
        RouterTestingModule
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableSingleRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
