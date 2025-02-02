import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelinquencyBucketComponent } from './delinquency-bucket.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('DelinquencyBucketComponent', () => {
  let component: DelinquencyBucketComponent;
  let fixture: ComponentFixture<DelinquencyBucketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DelinquencyBucketComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DelinquencyBucketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
