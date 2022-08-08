import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelinquencyBucketComponent } from './delinquency-bucket.component';

describe('DelinquencyBucketComponent', () => {
  let component: DelinquencyBucketComponent;
  let fixture: ComponentFixture<DelinquencyBucketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DelinquencyBucketComponent ]
    })
    .compileComponents();
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
