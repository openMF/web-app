import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocateCashComponent } from './allocate-cash.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';

describe('AllocateCashComponent', () => {
  let component: AllocateCashComponent;
  let fixture: ComponentFixture<AllocateCashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AllocateCashComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [DatePipe]
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
