import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDelinquencyBucketsComponent } from './manage-delinquency-buckets.component';

describe('ManageDelinquencyBucketsComponent', () => {
  let component: ManageDelinquencyBucketsComponent;
  let fixture: ComponentFixture<ManageDelinquencyBucketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageDelinquencyBucketsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageDelinquencyBucketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
