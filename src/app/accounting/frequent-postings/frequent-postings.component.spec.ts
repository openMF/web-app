import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FrequentPostingsComponent } from './frequent-postings.component';

describe('FrequentPostingsComponent', () => {
  let component: FrequentPostingsComponent;
  let fixture: ComponentFixture<FrequentPostingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FrequentPostingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrequentPostingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
