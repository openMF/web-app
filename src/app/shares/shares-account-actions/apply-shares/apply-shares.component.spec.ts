import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplySharesComponent } from './apply-shares.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('ApplySharesComponent', () => {
  let component: ApplySharesComponent;
  let fixture: ComponentFixture<ApplySharesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplySharesComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplySharesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
