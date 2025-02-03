import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBucketComponent } from './create-bucket.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

describe('CreateBucketComponent', () => {
  let component: CreateBucketComponent;
  let fixture: ComponentFixture<CreateBucketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateBucketComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule
      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBucketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
