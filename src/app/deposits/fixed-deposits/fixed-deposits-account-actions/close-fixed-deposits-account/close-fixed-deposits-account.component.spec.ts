import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseFixedDepositsAccountComponent } from './close-fixed-deposits-account.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('CloseFixedDepositsAccountComponent', () => {
  let component: CloseFixedDepositsAccountComponent;
  let fixture: ComponentFixture<CloseFixedDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CloseFixedDepositsAccountComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseFixedDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
