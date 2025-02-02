import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelinquencyBucketComponent } from './delinquency-bucket.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('DelinquencyBucketComponent', () => {
  let component: DelinquencyBucketComponent;
  let fixture: ComponentFixture<DelinquencyBucketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DelinquencyBucketComponent],
      imports: [
        TranslateModule,
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
    fixture = TestBed.createComponent(DelinquencyBucketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
