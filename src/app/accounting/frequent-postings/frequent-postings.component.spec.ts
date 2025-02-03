import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

import { FrequentPostingsComponent } from './frequent-postings.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('FrequentPostingsComponent', () => {
  let component: FrequentPostingsComponent;
  let fixture: ComponentFixture<FrequentPostingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FrequentPostingsComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
        CommonModule
      ]
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
