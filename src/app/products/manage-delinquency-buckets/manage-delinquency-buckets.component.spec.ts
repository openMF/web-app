import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDelinquencyBucketsComponent } from './manage-delinquency-buckets.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ManageDelinquencyBucketsComponent', () => {
  let component: ManageDelinquencyBucketsComponent;
  let fixture: ComponentFixture<ManageDelinquencyBucketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageDelinquencyBucketsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
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
