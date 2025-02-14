import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSavingProductComponent } from './edit-saving-product.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule, DatePipe } from '@angular/common';

describe('EditSavingProductComponent', () => {
  let component: EditSavingProductComponent;
  let fixture: ComponentFixture<EditSavingProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditSavingProductComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
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
    fixture = TestBed.createComponent(EditSavingProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
