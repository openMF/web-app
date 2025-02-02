import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAccountCloseComponent } from './loans-account-close.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('LoansAccountCloseComponent', () => {
  let component: LoansAccountCloseComponent;
  let fixture: ComponentFixture<LoansAccountCloseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoansAccountCloseComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoansAccountCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
