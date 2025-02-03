import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmazonS3Component } from './amazon-s3.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('AmazonS3Component', () => {
  let component: AmazonS3Component;
  let fixture: ComponentFixture<AmazonS3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AmazonS3Component],
      imports: [RouterTestingModule],
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
    fixture = TestBed.createComponent(AmazonS3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
