import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequentPostingsComponent } from './frequent-postings.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('FrequentPostingsComponent', () => {
  let component: FrequentPostingsComponent;
  let fixture: ComponentFixture<FrequentPostingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FrequentPostingsComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
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
