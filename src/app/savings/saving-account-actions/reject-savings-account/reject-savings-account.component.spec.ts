import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectSavingsAccountComponent } from './reject-savings-account.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('RejectSavingsAccountComponent', () => {
  let component: RejectSavingsAccountComponent;
  let fixture: ComponentFixture<RejectSavingsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RejectSavingsAccountComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
