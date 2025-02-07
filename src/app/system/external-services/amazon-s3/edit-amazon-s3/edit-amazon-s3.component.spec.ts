import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAmazonS3Component } from './edit-amazon-s3.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditAmazonS3Component', () => {
  let component: EditAmazonS3Component;
  let fixture: ComponentFixture<EditAmazonS3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditAmazonS3Component],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAmazonS3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
