import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateSavingsAccountComponent } from './activate-savings-account.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('ActivateSavingsAccountComponent', () => {
  let component: ActivateSavingsAccountComponent;
  let fixture: ComponentFixture<ActivateSavingsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActivateSavingsAccountComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
