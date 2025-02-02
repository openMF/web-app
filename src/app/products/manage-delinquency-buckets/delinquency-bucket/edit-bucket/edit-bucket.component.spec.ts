import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBucketComponent } from './edit-bucket.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ProductsService } from 'app/products/products.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditBucketComponent', () => {
  let component: EditBucketComponent;
  let fixture: ComponentFixture<EditBucketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditBucketComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule
      ],
      providers: [
        DatePipe,
        ProductsService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBucketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
