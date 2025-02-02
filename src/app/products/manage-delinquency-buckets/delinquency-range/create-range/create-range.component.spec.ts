import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRangeComponent } from './create-range.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('CreateRangeComponent', () => {
  let component: CreateRangeComponent;
  let fixture: ComponentFixture<CreateRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateRangeComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
