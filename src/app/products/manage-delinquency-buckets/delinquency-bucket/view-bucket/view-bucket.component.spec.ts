import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBucketComponent } from './view-bucket.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

describe('ViewBucketComponent', () => {
  let component: ViewBucketComponent;
  let fixture: ComponentFixture<ViewBucketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewBucketComponent],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBucketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
