import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocateCashComponent } from './allocate-cash.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('AllocateCashComponent', () => {
  let component: AllocateCashComponent;
  let fixture: ComponentFixture<AllocateCashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AllocateCashComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocateCashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
