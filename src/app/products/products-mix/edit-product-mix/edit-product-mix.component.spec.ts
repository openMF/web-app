import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProductMixComponent } from './edit-product-mix.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditProductMixComponent', () => {
  let component: EditProductMixComponent;
  let fixture: ComponentFixture<EditProductMixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditProductMixComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProductMixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
