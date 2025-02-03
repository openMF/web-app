import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProductMixComponent } from './view-product-mix.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';

describe('ViewProductMixComponent', () => {
  let component: ViewProductMixComponent;
  let fixture: ComponentFixture<ViewProductMixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewProductMixComponent],
      imports: [
        MatDialogModule,
        HttpClientModule,
        RouterTestingModule
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
    fixture = TestBed.createComponent(ViewProductMixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
