import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateChargeComponent } from './create-charge.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('CreateChargeComponent', () => {
  let component: CreateChargeComponent;
  let fixture: ComponentFixture<CreateChargeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateChargeComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
